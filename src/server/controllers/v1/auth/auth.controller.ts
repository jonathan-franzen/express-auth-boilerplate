import { until } from '@open-draft/until'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'

import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from '@/constants/auth.constants.js'
import {
  ACCESS_TOKEN_SECRET,
  APP_ENV,
  REFRESH_TOKEN_SECRET,
} from '@/constants/environment.constants.js'
import { HttpErrorService } from '@/server/services/error/http.error.service.js'
import { httpErrorService } from '@/server/services/error/index.js'
import { PrismaErrorService } from '@/server/services/error/prisma.error.service.js'
import { EventEmitterService } from '@/server/services/event-emitter/event-emitter.service.js'
import { JwtService } from '@/server/services/jwt/jwt.service.js'
import { MailerService } from '@/server/services/mailer/mailer.service.js'
import { RedisService } from '@/server/services/redis/redis.service.js'
import { ResetPasswordTokenService } from '@/server/services/reset-password-token/reset-password-token.service.js'
import { UserService } from '@/server/services/user/user.service.js'
import { UserTokenService } from '@/server/services/user-token/user-token.service.js'
import {
  LoginRequestBody,
  LoginResponse,
  LoginResponseData,
  OptionalRefreshTokenCookies,
  RefreshResponse,
  RefreshResponseData,
  RefreshTokenCookies,
  RegisterRequestBody,
  RegisterResponse,
  ResendVerifyEmailRequestBody,
  ResendVerifyEmailResponse,
  ResetPasswordRequestBody,
  ResetPasswordResponse,
  ResetPasswordTokenParams,
  SendResetPasswordEmailRequestBody,
  SendResetPasswordEmailResponse,
  VerifyEmailResponse,
  VerifyEmailTokenParams,
  VerifyResetPasswordTokenParams,
  VerifyResetPasswordTokenResponse,
  VerifySessionRequestBody,
  VerifySessionResponse,
  VerifySessionResponseData,
} from '@/types/auth.types.js'
import {
  JwtDecodedAccessToken,
  JwtDecodedRefreshToken,
  JwtDecodedResetPasswordToken,
  JwtDecodedVerifyEmailToken,
} from '@/types/jwt.types.js'
import { User, UserRoles } from '@/types/user.types.js'
import { logger } from '@/utils/logger.js'
import { sendResponse } from '@/utils/send-response.js'

export class AuthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly httpErrorService: HttpErrorService,
    private readonly prismaErrorService: PrismaErrorService,
    private readonly eventEmitterService: EventEmitterService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
    private readonly resetPasswordTokenService: ResetPasswordTokenService
  ) {}

  private async handleVerifyResetPasswordToken(resetPasswordToken: string) {
    const [resetPasswordTokenError, decodedResetPasswordToken] = await until(
      () =>
        this.jwtService.verifyToken<JwtDecodedResetPasswordToken>(
          resetPasswordToken,
          ACCESS_TOKEN_SECRET,
          'resetPassword'
        )
    )

    if (resetPasswordTokenError) {
      const [deleteTokenError] = await until(() =>
        this.resetPasswordTokenService.deleteResetPasswordToken({
          token: resetPasswordToken,
        })
      )

      if (
        deleteTokenError &&
        !this.prismaErrorService.isRecordNotExistError(deleteTokenError)
      ) {
        logger.alert({
          context: { error: resetPasswordTokenError },
          message: 'Failed to delete invalid reset password token.',
        })

        throw deleteTokenError
      }
      throw resetPasswordTokenError
    }

    const tokenExists =
      await this.resetPasswordTokenService.getResetPasswordToken({
        token: resetPasswordToken,
      })

    if (!tokenExists) {
      throw this.httpErrorService.tokenInvalidError()
    }

    const email = decodedResetPasswordToken.resetPassword.email

    const foundUser = await this.userService.getUser({ email })

    if (!foundUser) {
      logger.error({
        context: {
          email,
        },
        message: 'Attempt to verify resetPasswordToken on non-existing user.',
      })

      throw this.httpErrorService.tokenInvalidError()
    }

    return email
  }

  private async handleRefresh(res: Response, refreshToken: string) {
    const userToken = await this.userTokenService.getUserToken({
      token: refreshToken,
    })

    if (
      !userToken ||
      (userToken.usedAt && userToken.usedAt.getTime() < Date.now() - 15_000)
    ) {
      const [decodedRefreshTokenError, decodedRefreshToken] = await until(() =>
        this.jwtService.verifyToken<JwtDecodedRefreshToken>(
          refreshToken,
          REFRESH_TOKEN_SECRET,
          'email'
        )
      )

      if (decodedRefreshTokenError) {
        res.clearCookie('refreshToken', {
          httpOnly: true,
          sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
          secure: APP_ENV === 'prod',
        })

        throw decodedRefreshTokenError
      }

      const foundUser = await this.userService.getUser({
        email: decodedRefreshToken.email,
      })

      if (foundUser) {
        await this.userTokenService.deleteUserTokens({ userId: foundUser.id })

        logger.alert({
          context: {
            email: foundUser.email,
          },
          message: 'Attempt to reuse refresh token mitigated.',
        })
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
        secure: APP_ENV === 'prod',
      })

      throw this.httpErrorService.tokenInvalidError()
    }

    const [refreshTokenError, decodedRefreshToken] = await until(() =>
      this.jwtService.verifyToken<JwtDecodedRefreshToken>(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        'email'
      )
    )

    if (!userToken.usedAt) {
      const [deprecateRefreshTokenError] = await until(() =>
        this.userTokenService.updateUserToken(
          { token: refreshToken },
          { usedAt: new Date() }
        )
      )

      if (
        deprecateRefreshTokenError &&
        !this.prismaErrorService.isRecordNotExistError(
          deprecateRefreshTokenError
        )
      ) {
        logger.alert({
          context: { error: deprecateRefreshTokenError },
          message: 'Failed to deprecate invalid/expired refresh token.',
        })

        res.clearCookie('refreshToken', {
          httpOnly: true,
          sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
          secure: APP_ENV === 'prod',
        })

        throw this.httpErrorService.internalServerError()
      }
    }

    if (refreshTokenError) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
        secure: APP_ENV === 'prod',
      })

      throw refreshTokenError
    }

    const email = decodedRefreshToken.email

    const accessToken = this.jwtService.signAccessToken(userToken.userId, email)
    const newRefreshToken = this.jwtService.signRefreshToken(email)

    await this.userTokenService.createUserToken({
      token: newRefreshToken,
      userId: userToken.userId,
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_LIFETIME * 1000,
      sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
      secure: APP_ENV === 'prod',
    })

    return { accessToken }
  }

  async register(req: Request, res: Response) {
    const { email, firstName, lastName, password } =
      req.body as RegisterRequestBody

    const duplicate = await this.userService.getUser({ email })

    if (duplicate) {
      logger.warning({
        context: {
          email,
        },
        message: 'User not created. Email already in use.',
      })

      throw this.httpErrorService.emailAlreadyInUseError()
    }

    const createdUser = await this.userService.createUser({
      email,
      firstName,
      lastName,
      password,
      roles: [UserRoles.USER],
    })

    const verifyEmailToken = this.jwtService.signVerifyEmailToken(
      createdUser.email
    )

    const emailOptions = this.mailerService.getVerifyEmailOptions(
      createdUser,
      verifyEmailToken
    )

    this.eventEmitterService.sendEmail(emailOptions)

    return sendResponse<'data', User>(res, 201, {
      message: 'User successfully created.',
      data: createdUser,
    } satisfies RegisterResponse)
  }

  async verifyEmail(req: Request, res: Response) {
    const { verifyEmailToken } = req.params as VerifyEmailTokenParams

    const [verifyEmailTokenError, decodedVerifyEmailToken] = await until(() =>
      this.jwtService.verifyToken<JwtDecodedVerifyEmailToken>(
        verifyEmailToken,
        ACCESS_TOKEN_SECRET,
        'verifyEmail'
      )
    )

    if (verifyEmailTokenError) {
      const decoded =
        this.jwtService.decodeToken<JwtDecodedVerifyEmailToken>(
          verifyEmailToken
        )

      if (!!decoded && typeof decoded === 'object' && decoded.verifyEmail) {
        const email = decoded.verifyEmail.email
        const foundUser = await this.userService.getUser({ email })

        if (foundUser?.emailVerifiedAt) {
          logger.warning({
            context: {
              email,
            },
            message: 'Email already verified.',
          })

          return sendResponse<'message'>(res, 200, {
            message: 'Email already verified.',
          } satisfies VerifyEmailResponse)
        }
      }
      throw verifyEmailTokenError
    }

    const email = decodedVerifyEmailToken.verifyEmail.email

    const foundUser = await this.userService.getUser({ email })

    if (!foundUser) {
      logger.alert({
        context: {
          email,
          verifyEmailToken,
        },
        message: 'Attempt to verify email on non-existing user.',
      })

      throw this.httpErrorService.tokenInvalidError()
    }

    if (foundUser.emailVerifiedAt) {
      logger.warning({
        context: {
          email,
        },
        message: 'Email already verified.',
      })

      return sendResponse<'message'>(res, 200, {
        message: 'Email already verified.',
      } satisfies VerifyEmailResponse)
    }

    await this.userService.updateUser(
      { email: foundUser.email },
      {
        emailVerifiedAt: new Date(Date.now()),
      }
    )

    return sendResponse<'message'>(res, 200, {
      message: 'Email successfully verified.',
    } satisfies VerifyEmailResponse)
  }

  async resendVerifyEmail(req: Request, res: Response) {
    const { email } = req.body as ResendVerifyEmailRequestBody

    const user = await this.userService.getUser({ email })

    if (!user) {
      return sendResponse<'message'>(res, 200, {
        message: 'Email successfully sent.',
      } satisfies ResendVerifyEmailResponse)
    }

    if (user.emailVerifiedAt) {
      return sendResponse<'message'>(res, 200, {
        message: 'Email already verified.',
      } satisfies ResendVerifyEmailResponse)
    }

    const redisKey = `verify-email:${user.id}`

    const redisRes = await this.redisService.setIfNotExists(
      redisKey,
      '1',
      5 * 60
    )

    if (!redisRes) {
      throw httpErrorService.emailRequestsExceededError(5 * 60)
    }

    const verifyEmailToken = this.jwtService.signVerifyEmailToken(user.email)

    const emailOptions = this.mailerService.getVerifyEmailOptions(
      user,
      verifyEmailToken
    )

    this.eventEmitterService.sendEmail(emailOptions)

    return sendResponse<'message'>(res, 200, {
      message: 'Email successfully sent.',
    } satisfies ResendVerifyEmailResponse)
  }

  async login(req: Request, res: Response) {
    const { refreshToken } = req.cookies as OptionalRefreshTokenCookies
    const { email, password } = req.body as LoginRequestBody

    const user = await this.userService.getUserWithValidatePassword({ email })

    if (!user) {
      logger.warning({
        context: {
          email,
        },
        message: 'Attempt to login on non-existing user.',
      })

      // Bcrypt to make sure response time is consistent.
      await bcrypt.compare(password, 'random')
      throw this.httpErrorService.invalidCredentialsError()
    }

    const passwordsMatch = await user.validatePassword(password)

    if (!passwordsMatch) {
      logger.warning({
        context: {
          email,
        },
        message: 'Incorrect password.',
      })

      throw this.httpErrorService.invalidCredentialsError()
    }

    if (refreshToken) {
      const [error] = await until(() =>
        this.userTokenService.deleteUserToken({ token: refreshToken })
      )

      if (error) {
        const [refreshTokenError] = await until(() =>
          this.jwtService.verifyToken<JwtDecodedRefreshToken>(
            refreshToken,
            REFRESH_TOKEN_SECRET,
            'email'
          )
        )

        if (!refreshTokenError) {
          if (this.prismaErrorService.isRecordNotExistError(error)) {
            logger.alert({
              context: {
                email,
              },
              message: 'Attempt to reuse refresh token at login.',
            })

            await this.userTokenService.deleteUserTokens({ userId: user.id })
          } else {
            logger.error({
              context: { error },
              message: 'Failed to delete refresh token.',
            })

            throw this.httpErrorService.internalServerError()
          }
        }
      }
    }

    const accessToken = this.jwtService.signAccessToken(user.id, user.email)
    const newRefreshToken = this.jwtService.signRefreshToken(user.email)

    await this.userTokenService.createUserToken({
      token: newRefreshToken,
      userId: user.id,
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_LIFETIME * 1000,
      sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
      secure: APP_ENV === 'prod',
    })

    return sendResponse<'data', LoginResponseData>(res, 200, {
      message: 'Login successful.',
      data: { accessToken, user },
    } satisfies LoginResponse)
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.cookies as RefreshTokenCookies

    const { accessToken } = await this.handleRefresh(res, refreshToken)

    return sendResponse<'data', RefreshResponseData>(res, 200, {
      message: 'Refresh successful.',
      data: { accessToken },
    } satisfies RefreshResponse)
  }

  async verifySession(req: Request, res: Response) {
    const { refreshToken } = req.cookies as RefreshTokenCookies
    const { accessToken } = req.body as VerifySessionRequestBody

    const [, decodedAccessToken] = await until(() =>
      this.jwtService.verifyToken<JwtDecodedAccessToken>(
        accessToken,
        ACCESS_TOKEN_SECRET,
        'userInfo'
      )
    )

    if (
      decodedAccessToken?.exp &&
      decodedAccessToken.exp * 1000 - Date.now() >
        (ACCESS_TOKEN_LIFETIME * 1000) / 2
    ) {
      return sendResponse<'empty'>(res, 204, undefined)
    }

    const { accessToken: newAccessToken } = await this.handleRefresh(
      res,
      refreshToken
    )

    return sendResponse<'data', VerifySessionResponseData>(res, 200, {
      message: 'Session invalid. Refresh successful.',
      data: { accessToken: newAccessToken },
    } satisfies VerifySessionResponse)
  }

  async sendResetPasswordEmail(req: Request, res: Response) {
    const { email } = req.body as SendResetPasswordEmailRequestBody

    const user = await this.userService.getUser({ email })

    if (!user) {
      logger.warning({
        context: { email },
        message: 'Attempted to send reset password email to non-existing user.',
      })

      return sendResponse<'message'>(res, 200, {
        message: 'Email sent.',
      } satisfies SendResetPasswordEmailResponse)
    }

    const redisKey = `reset-password-email:${user.id}`

    const redisRes = await this.redisService.setIfNotExists(
      redisKey,
      '1',
      5 * 60
    )

    if (!redisRes) {
      throw httpErrorService.emailRequestsExceededError(5 * 60)
    }

    const resetPasswordToken = this.jwtService.signResetPasswordToken(
      user.email
    )

    await this.resetPasswordTokenService.upsertResetPasswordToken(
      resetPasswordToken,
      user.id
    )

    const emailOptions = this.mailerService.getResetPasswordEmailOptions(
      user,
      resetPasswordToken
    )

    this.eventEmitterService.sendEmail(emailOptions)

    return sendResponse<'message'>(res, 200, {
      message: 'Email sent.',
    } satisfies SendResetPasswordEmailResponse)
  }

  async verifyResetPasswordToken(req: Request, res: Response) {
    const { resetPasswordToken } = req.params as VerifyResetPasswordTokenParams

    await this.handleVerifyResetPasswordToken(resetPasswordToken)

    return sendResponse<'message'>(res, 200, {
      message: 'Token is valid.',
    } satisfies VerifyResetPasswordTokenResponse)
  }

  async resetPassword(req: Request, res: Response) {
    const { resetPasswordToken } = req.params as ResetPasswordTokenParams
    const { newPassword } = req.body as ResetPasswordRequestBody

    const email = await this.handleVerifyResetPasswordToken(resetPasswordToken)

    await this.userService.updateUser(
      { email },
      {
        password: newPassword,
      }
    )

    await this.resetPasswordTokenService.deleteResetPasswordToken({
      token: resetPasswordToken,
    })

    return sendResponse<'message'>(res, 200, {
      message: 'Password successfully updated.',
    } satisfies ResetPasswordResponse)
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.cookies as RefreshTokenCookies

    const [error] = await until(() =>
      this.userTokenService.deleteUserToken({ token: refreshToken })
    )

    if (error && !this.prismaErrorService.isRecordNotExistError(error)) {
      logger.alert({
        context: { error },
        message: 'Failed to delete refresh token.',
      })
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: APP_ENV === 'prod' ? 'none' : 'lax',
      secure: APP_ENV === 'prod',
    })

    return sendResponse<'empty'>(res, 204, undefined)
  }
}
