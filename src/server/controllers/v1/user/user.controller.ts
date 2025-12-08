import { until } from '@open-draft/until'
import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'

import { REFRESH_TOKEN_LIFETIME } from '@/config/app.config.js'
import { NODE_ENV } from '@/config/env.config.js'
import { getNameSearchFilter } from '@/server/prisma/utils/get-name-search-filter.js'
import { HttpErrorService } from '@/server/services/error/http.error.service.js'
import { PrismaErrorService } from '@/server/services/error/prisma.error.service.js'
import { JwtService } from '@/server/services/jwt/jwt.service.js'
import { UserService } from '@/server/services/user/user.service.js'
import { UserTokenService } from '@/server/services/user-token/user-token.service.js'
import { AuthenticatedRequest } from '@/types/api.types.js'
import {
  ChangePasswordRequestBody,
  ChangePasswordResponse,
  ChangePasswordResponseData,
  GetSelfResponse,
  GetUserByIdResponse,
  ListUsersRequestBody,
  ListUsersResponse,
  UpdateSelfRequestBody,
  UpdateSelfResponse,
  UpdateUserRequestBody,
  UpdateUserResponse,
  User,
  UserIdParams,
} from '@/types/user.types.js'
import { logger } from '@/utils/logger.js'
import { sendResponse } from '@/utils/send-response.js'

export class UserController {
  constructor(
    private readonly httpErrorService: HttpErrorService,
    private readonly prismaErrorService: PrismaErrorService,
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
    private readonly jwtService: JwtService
  ) {}

  getSelf(req: AuthenticatedRequest, res: Response) {
    const selfData = req.user

    return sendResponse<'data', User>(res, 200, {
      message: 'Success.',
      data: selfData,
    } satisfies GetSelfResponse)
  }

  async updateSelf(req: AuthenticatedRequest, res: Response) {
    const userUpdateInput = req.body as UpdateSelfRequestBody

    if (userUpdateInput.email && userUpdateInput.email !== req.user.email) {
      const duplicate = await this.userService.getUser({
        email: userUpdateInput.email,
      })

      if (duplicate) {
        throw this.httpErrorService.emailAlreadyInUseError()
      }
    }

    const selfData = await this.userService.updateUser(
      { id: req.user.id },
      {
        ...userUpdateInput,
      }
    )

    return sendResponse<'data', User>(res, 200, {
      message: 'Success.',
      data: selfData,
    } satisfies UpdateSelfResponse)
  }

  async changePassword(req: Request, res: Response) {
    const { newPassword, password } = req.body as ChangePasswordRequestBody

    // We need to fetch user again, since we need the validatePassword function that is not provided by auth middleware.
    const user = await this.userService.getUserWithValidatePassword({
      id: req.user?.id,
    })

    if (!user) {
      logger.alert({
        context: {
          id: req.user?.id,
        },
        message: 'Cannot find user when changing password.',
      })

      throw this.httpErrorService.internalServerError()
    }

    const passwordsMatch = await user.validatePassword(password)

    if (!passwordsMatch) {
      logger.warning({
        context: {
          email: user.email,
        },
        message: 'Incorrect password when changing.',
      })

      throw this.httpErrorService.incorrectPasswordError()
    }

    await this.userTokenService.deleteUserTokens({ userId: user.id })

    await this.userService.updateUser(
      { email: user.email },
      {
        password: newPassword,
      }
    )

    const accessToken = this.jwtService.signAccessToken(user.id, user.email)
    const refreshToken = this.jwtService.signRefreshToken(user.email)

    await this.userTokenService.createUserToken({
      token: refreshToken,
      userId: user.id,
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_LIFETIME * 1000,
      sameSite: NODE_ENV === 'prod' ? 'none' : 'lax',
      secure: NODE_ENV === 'prod',
    })

    return sendResponse<'data', ChangePasswordResponseData>(res, 200, {
      message: 'Password successfully changed.',
      data: { accessToken },
    } satisfies ChangePasswordResponse)
  }

  async getUserById(req: Request, res: Response) {
    const { userId } = req.params as UserIdParams

    const user = await this.userService.getUser({ id: userId })

    if (!user) {
      logger.warning({
        context: {
          id: userId,
        },
        message: 'User ID not found.',
      })

      throw this.httpErrorService.notFoundError()
    }

    return sendResponse<'data', User>(res, 200, {
      message: 'Success.',
      data: user,
    } satisfies GetUserByIdResponse)
  }

  async listUsers(req: Request, res: Response) {
    const { pagination, filter, orderBy } = req.body as ListUsersRequestBody

    const nameSearchFilter = getNameSearchFilter(filter?.search)

    const where: Prisma.UserWhereInput = {
      ...(filter?.search && {
        OR: [
          nameSearchFilter,
          {
            email: { contains: filter.search, mode: 'insensitive' },
          },
        ],
      }),
    }

    const [users, count] = await Promise.all([
      this.userService.getUsers({
        where,
        skip: pagination.page * pagination.pageSize,
        take: pagination.pageSize,
        orderBy,
      }),
      this.userService.getUserCount(where),
    ])

    return sendResponse<'pagination', User>(res, 200, {
      message: 'Success.',
      data: users,
      count,
      pageSize: pagination.pageSize,
      page: pagination.page,
    } satisfies ListUsersResponse)
  }

  async updateUser(req: Request, res: Response) {
    const { userId } = req.params as UserIdParams
    const userUpdateInput = req.body as UpdateUserRequestBody

    if (userUpdateInput.email) {
      const potentialDuplicate = await this.userService.getUser({
        email: userUpdateInput.email,
      })

      if (potentialDuplicate?.id && potentialDuplicate.id !== userId) {
        throw this.httpErrorService.emailAlreadyInUseError()
      }
    }

    const user = await this.userService.updateUser(
      { id: userId },
      {
        ...userUpdateInput,
      }
    )

    return sendResponse<'data', User>(res, 200, {
      message: 'Success.',
      data: user,
    } satisfies UpdateUserResponse)
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params as UserIdParams

    if (userId === req.user.id) {
      throw this.httpErrorService.unableToDeleteSelfError()
    }

    const [error] = await until(() =>
      this.userService.deleteUser({ id: userId })
    )

    if (error) {
      if (this.prismaErrorService.isRecordNotExistError(error)) {
        throw this.httpErrorService.notFoundError()
      } else {
        logger.alert({
          context: { error, userId },
          message: 'Failed to delete user.',
        })

        throw this.httpErrorService.internalServerError()
      }
    }

    return sendResponse<'empty'>(res, 204, undefined)
  }
}
