import { Request, Response, Router } from 'express'
import asyncHandler from 'express-async-handler'

import { userController } from '@/server/controllers/v1/user/index.js'
import { authMiddleware } from '@/server/middlewares/auth.middleware.js'
import { validateRequestMiddleware } from '@/server/middlewares/validate-request.middleware.js'
import { verifyRolesMiddleware } from '@/server/middlewares/verify-roles.middleware.js'
import { AuthenticatedRequest } from '@/types/api.types.js'
import { UserRoles } from '@/types/user.types.js'
import {
  changePasswordValidator,
  deleteUserValidator,
  getUserByIdValidator,
  listUsersValidator,
  updateSelfValidator,
  updateUserValidator,
} from '@/validators/user.validators.js'

export const userRouter = Router()

userRouter.get(
  '/me',
  authMiddleware,
  asyncHandler((req: Request, res: Response) => {
    userController.getSelf(req as AuthenticatedRequest, res)
  })
)

userRouter.patch(
  '/me',
  authMiddleware,
  validateRequestMiddleware(updateSelfValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.updateSelf(req as AuthenticatedRequest, res)
  })
)

userRouter.post(
  '/me/change-password',
  authMiddleware,
  validateRequestMiddleware(changePasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.changePassword(req as AuthenticatedRequest, res)
  })
)

userRouter.post(
  '/list',
  authMiddleware,
  validateRequestMiddleware(listUsersValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.listUsers(req, res)
  })
)

userRouter.get(
  '/:userId',
  authMiddleware,
  validateRequestMiddleware(getUserByIdValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.getUserById(req, res)
  })
)

userRouter.patch(
  '/:userId',
  authMiddleware,
  validateRequestMiddleware(updateUserValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.updateUser(req, res)
  })
)

userRouter.delete(
  '/:userId',
  authMiddleware,
  validateRequestMiddleware(deleteUserValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.deleteUser(req as AuthenticatedRequest, res)
  })
)
