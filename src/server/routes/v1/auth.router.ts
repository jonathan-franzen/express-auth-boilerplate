import { Request, Response, Router } from 'express'
import asyncHandler from 'express-async-handler'

import { authController } from '@/server/controllers/v1/auth/index.js'
import { validateRequestMiddleware } from '@/server/middlewares/validate-request.middleware.js'
import { loginValidator } from '@/validators/auth/login.validator.js'
import { logoutValidator } from '@/validators/auth/logout.validator.js'
import { refreshValidator } from '@/validators/auth/refresh.validator.js'
import { registerValidator } from '@/validators/auth/register.validator.js'
import { resendVerifyEmailValidator } from '@/validators/auth/resend-verify-email.validator.js'
import { resetPasswordValidator } from '@/validators/auth/reset-password.validator.js'
import { sendResetPasswordEmailValidator } from '@/validators/auth/send-reset-password-email.validator.js'
import { verifyEmailValidator } from '@/validators/auth/verify-email.validator.js'
import { verifyResetPasswordTokenValidator } from '@/validators/auth/verify-reset-password-token.validator.js'

const authRouter = Router()

authRouter.post(
  '/register',
  validateRequestMiddleware(registerValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.register(req, res)
  })
)

authRouter.post(
  '/verify-email/:verifyEmailToken',
  validateRequestMiddleware(verifyEmailValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.verifyEmail(req, res)
  })
)

authRouter.post(
  '/resend-verify-email',
  validateRequestMiddleware(resendVerifyEmailValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.resendVerifyEmail(req, res)
  })
)

authRouter.post(
  '/login',
  validateRequestMiddleware(loginValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.login(req, res)
  })
)

authRouter.post(
  '/refresh',
  validateRequestMiddleware(refreshValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.refresh(req, res)
  })
)

authRouter.post(
  '/reset-password',
  validateRequestMiddleware(sendResetPasswordEmailValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.sendResetPasswordEmail(req, res)
  })
)

authRouter.get(
  '/reset-password/:resetPasswordToken',
  validateRequestMiddleware(verifyResetPasswordTokenValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.verifyResetPasswordToken(req, res)
  })
)

authRouter.post(
  '/reset-password/:resetPasswordToken',
  validateRequestMiddleware(resetPasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.resetPassword(req, res)
  })
)

authRouter.delete(
  '/logout',
  validateRequestMiddleware(logoutValidator),
  asyncHandler(async (req: Request, res: Response) => {
    await authController.logout(req, res)
  })
)

export { authRouter }
