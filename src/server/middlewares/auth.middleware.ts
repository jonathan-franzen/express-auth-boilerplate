import { until } from '@open-draft/until'
import { NextFunction, Request, Response } from 'express'

import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js'
import { httpErrorService } from '@/server/services/error/index.js'
import { jwtService } from '@/server/services/jwt/index.js'
import { userService } from '@/server/services/user/index.js'

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const bearer = req.headers.authorization

  if (!bearer) {
    throw httpErrorService.tokenInvalidError()
  }

  const token = bearer.split('Bearer ')[1]
  if (!token) {
    throw httpErrorService.tokenInvalidError()
  }

  const decoded = await jwtService.verifyToken(
    token,
    ACCESS_TOKEN_SECRET,
    'userInfo'
  )

  if (decoded.exp && Date.now() >= decoded.exp * 1000) {
    throw httpErrorService.tokenExpiredError()
  }

  if (!decoded.userInfo.id) {
    throw httpErrorService.tokenInvalidError()
  }

  const [err, data] = await until(() =>
    userService.getUser({ id: decoded.userInfo.id })
  )

  if (err) {
    throw httpErrorService.tokenInvalidError()
  }

  if (!data) {
    throw httpErrorService.tokenInvalidError()
  }

  req.user = data

  next()
}
