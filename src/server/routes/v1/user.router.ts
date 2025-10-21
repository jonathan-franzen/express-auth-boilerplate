import { Request, Response, Router } from 'express'
import asyncHandler from 'express-async-handler'

import { userController } from '@/server/controllers/user/index.js'
import { validateRequestMiddleware } from '@/server/middlewares/validate-request.middleware.js'
import { verifyRolesMiddleware } from '@/server/middlewares/verify-roles.middleware.js'
import { AuthenticatedRequest } from '@/types/api/request.types.js'
import { UserRoles } from '@/types/user/user.types.js'
import { changePasswordValidator } from '@/validators/user/change-password.validator.js'
import { getUserValidator } from '@/validators/user/get-user.validator.js'
import { getUsersValidator } from '@/validators/user/get-users.validator.js'
import { updateSelfValidator } from '@/validators/user/update-self.validator.js'

const userRouter = Router()

userRouter.get(
  '/me',
  asyncHandler((req: Request, res: Response) => {
    userController.getSelf(req as AuthenticatedRequest, res)
  })
)

userRouter.patch(
  '/me',
  validateRequestMiddleware(updateSelfValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.updateSelf(req as AuthenticatedRequest, res)
  })
)

userRouter.post(
  '/me/change-password',
  validateRequestMiddleware(changePasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.changePassword(req as AuthenticatedRequest, res)
  })
)

userRouter.get(
  '/',
  validateRequestMiddleware(getUsersValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.getUsers(req, res)
  })
)

userRouter.get(
  '/:id',
  validateRequestMiddleware(getUserValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.getUser(req, res)
  })
)

userRouter.patch(
  '/:id',
  validateRequestMiddleware(getUserValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.updateUser(req, res)
  })
)

userRouter.delete(
  '/:id',
  validateRequestMiddleware(getUserValidator),
  verifyRolesMiddleware(UserRoles.ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    await userController.deleteUser(req as AuthenticatedRequest, res)
  })
)

export { userRouter }
