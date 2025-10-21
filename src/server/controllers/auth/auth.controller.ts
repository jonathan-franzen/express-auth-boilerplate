import { until } from '@open-draft/until'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'

import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js'
import {
  ACCESS_TOKEN_SECRET,
  APP_ENV,
  REFRESH_TOKEN_SECRET,
} from '@/constants/environment.constants.js'
import { HttpErrorService } from '@/server/services/error/http.error.service.js'
import { PrismaErrorService } from '@/server/services/error/prisma.error.service.js'
import { EventEmitterService } from '@/server/services/event-emitter/event-emitter.service.js'
import { JwtService } from '@/server/services/jwt/jwt.service.js'
import { MailerService } from '@/server/services/mailer/mailer.service.js'
import { ResetPasswordTokenService } from '@/server/services/reset-password-token/reset-password-token.service.js'
import { UserService } from '@/server/services/user/user.service.js'
import { UserTokenService } from '@/server/services/user-token/user-token.service.js'
import {
  LoginRequestBody,
  LoginRequestCookies,
  LoginResponseData,
} from '@/types/auth/login.types.js'
import { LogoutRequestCookies } from '@/types/auth/logout.types.js'
import {
  RefreshRequestCookies,
  RefreshResponseData,
} from '@/types/auth/refresh.types.js'
import { RegisterRequestBody } from '@/types/auth/register.types.js'
import { ResendVerifyEmailRequestBody } from '@/types/auth/resend-verify-email.types.js'
import {
  ResetPasswordRequestBody,
  ResetPasswordRequestParams,
} from '@/types/auth/reset-password.types.js'
import { SendResetPasswordEmailRequestBody } from '@/types/auth/send-reset-password-email.types.js'
import { VerifyEmailRequestParams } from '@/types/auth/verify-email.types.js'
import { VerifyResetPasswordTokenRequestParams } from '@/types/auth/verify-reset-password-token.types.js'
import {
  JwtDecodedRefreshToken,
  JwtDecodedResetPasswordToken,
  JwtDecodedVerifyEmailToken,
} from '@/types/jwt/jwt.types.js'
import { User } from '@/types/user/user.types.js'
import { logger } from '@/utils/logger.js'
import { sendResponse } from '@/utils/send-response.js'

class AuthController {
  constructor(
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
    const [resetPasswordTokenTokenError, decodedResetPasswordToken] =
      await until(() =>
        this.jwtService.verifyToken<JwtDecodedResetPasswordToken>(
          resetPasswordToken,
          ACCESS_TOKEN_SECRET,
          'resetPassword'
        )
      )

    if (resetPasswordTokenTokenError) {
      const [deleteTokenError] = await until(() =>
        this.resetPasswordTokenService.deleteResetPasswordToken({
          token: resetPasswordToken,
        })
      )

      if (
        decodedResetPasswordToken &&
        !this.prismaErrorService.isRecordNotExistError(deleteTokenError)
      ) {
        logger.alert({
          context: { error: resetPasswordTokenTokenError },
          message: 'Failed to delete invalid reset password token.',
        })

        throw deleteTokenError
      }
      throw resetPasswordTokenTokenError
    }

    const tokenExists =
      await this.resetPasswordTokenService.getResetPasswordToken({
        token: resetPasswordToken,
      })

    if (!tokenExists) {
      throw this.httpErrorService.tokenExpiredError()
    }

    const email = decodedResetPasswordToken.resetPassword.email

    const foundUser = await this.userService.getUser({ email })

    if (!foundUser) {
      logger.error({
        context: {
          email,
        },
        message:
          'Attempt to reset-password-token verification on non-existing user.',
      })

      throw this.httpErrorService.tokenInvalidError()
    }

    return email
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
    })
  }

  async verifyEmail(req: Request, res: Response) {
    const { verifyEmailToken } = req.params as VerifyEmailRequestParams

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
          })
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
      })
    }

    await this.userService.updateUser(
      { email: foundUser.email },
      {
        emailVerifiedAt: new Date(Date.now()),
      }
    )

    return sendResponse<'message'>(res, 200, {
      message: 'Email successfully verified.',
    })
  }

  async resendVerifyEmail(req: Request, res: Response) {
    const { email } = req.body as ResendVerifyEmailRequestBody

    const user = await this.userService.getUser({ email })

    if (!user) {
      return sendResponse<'message'>(res, 200, {
        message: 'Email successfully sent.',
      })
    }

    if (user.emailVerifiedAt) {
      return sendResponse<'message'>(res, 200, {
        message: 'Email already verified.',
      })
    }

    const verifyEmailToken = this.jwtService.signVerifyEmailToken(user.email)

    const emailOptions = this.mailerService.getVerifyEmailOptions(
      user,
      verifyEmailToken
    )

    this.eventEmitterService.sendEmail(emailOptions)

    return sendResponse<'message'>(res, 200, {
      message: 'Email successfully sent.',
    })
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginRequestBody
    const { refreshToken } = req.cookies as LoginRequestCookies

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

    const accessToken = this.jwtService.signAccessToken(user.id, user.email)
    const newRefreshToken = this.jwtService.signRefreshToken(user.email)

    await this.userTokenService.createUserToken({
      token: newRefreshToken,
      userId: user.id,
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_LIFETIME * 1000,
      sameSite: 'none',
      secure: APP_ENV === 'prod',
    })

    return sendResponse<'data', LoginResponseData>(res, 200, {
      message: 'Login successful.',
      data: { accessToken },
    })
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.cookies as RefreshRequestCookies

    const userToken = await this.userTokenService.getUserToken({
      token: refreshToken,
    })

    if (!userToken) {
      const decodedRefreshToken =
        await this.jwtService.verifyToken<JwtDecodedRefreshToken>(
          refreshToken,
          REFRESH_TOKEN_SECRET,
          'email'
        )

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
        sameSite: 'none',
        secure: false,
      })

      throw this.httpErrorService.tokenInvalidError()
    }

    const [refreshTokenTokenError, decodedRefreshToken] = await until(() =>
      this.jwtService.verifyToken<JwtDecodedRefreshToken>(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        'email'
      )
    )

    const [deleteRefreshTokenError] = await until(() =>
      this.userTokenService.deleteUserToken({ token: refreshToken })
    )

    if (
      deleteRefreshTokenError &&
      !this.prismaErrorService.isRecordNotExistError(deleteRefreshTokenError)
    ) {
      logger.alert({
        context: { error: deleteRefreshTokenError },
        message: 'Failed to delete invalid/expired refresh token.',
      })

      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: false,
      })

      throw this.httpErrorService.internalServerError()
    }

    if (refreshTokenTokenError) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: false,
      })

      throw refreshTokenTokenError
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
      sameSite: 'none',
      secure: process.env.APP_ENV === 'prod',
    })

    return sendResponse<'data', RefreshResponseData>(res, 200, {
      message: 'Refresh successful.',
      data: { accessToken },
    })
  }

  async sendResetPasswordEmail(req: Request, res: Response) {
    const { email } = req.body as SendResetPasswordEmailRequestBody

    const user = await this.userService.getUser({ email })

    if (!user) {
      return sendResponse<'message'>(res, 200, {
        message: 'Email sent.',
      })
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
    })
  }

  async verifyResetPasswordToken(req: Request, res: Response) {
    const { resetPasswordToken } =
      req.params as VerifyResetPasswordTokenRequestParams

    await this.handleVerifyResetPasswordToken(resetPasswordToken)

    return sendResponse<'message'>(res, 200, {
      message: 'Token is valid.',
    })
  }

  async resetPassword(req: Request, res: Response) {
    const { resetPasswordToken } = req.params as ResetPasswordRequestParams
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
    })
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.cookies as LogoutRequestCookies

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
      sameSite: 'none',
      secure: false,
    })

    return sendResponse<'empty'>(res, 204, undefined)
  }
}

export { AuthController }
