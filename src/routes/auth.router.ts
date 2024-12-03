import { authController } from '@/controllers/auth/index.js';
import { expressValidatorMiddleware } from '@/middlewares/express-validator.middleware.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { loginAuthValidator } from '@/validators/auth/login.auth.validator.js';
import { logoutAuthValidator } from '@/validators/auth/logout.auth.validator.js';
import { refreshAuthValidator } from '@/validators/auth/refresh.auth.validator.js';
import { registerAuthValidator } from '@/validators/auth/register.auth.validator.js';
import { resendVerifyEmailAuthValidator } from '@/validators/auth/resend-verify-email.auth.validator.js';
import { resetPasswordAuthValidator } from '@/validators/auth/reset-password.auth.validator.js';
import { sendResetPasswordEmailAuthValidator } from '@/validators/auth/send-reset-password-email.auth.validator.js';
import { verifyEmailAuthValidator } from '@/validators/auth/verify-email.auth.validator.js';
import express, { Request, Response, Router } from 'express';

export const authRouter: Router = express.Router();

authRouter.post(
	'/register',
	expressValidatorMiddleware(registerAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.register(req, res);
	}),
);

authRouter.post(
	'/verify-email/:verifyEmailToken',
	expressValidatorMiddleware(verifyEmailAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.verifyEmail(req, res);
	}),
);

authRouter.post(
	'/resend-verify-email',
	expressValidatorMiddleware(resendVerifyEmailAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.resendVerifyEmail(req, res);
	}),
);

authRouter.post(
	'/login',
	expressValidatorMiddleware(loginAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.login(req, res);
	}),
);

authRouter.post(
	'/refresh',
	expressValidatorMiddleware(refreshAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.refresh(req, res);
	}),
);

authRouter.post(
	'/reset-password',
	expressValidatorMiddleware(sendResetPasswordEmailAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.sendResetPasswordEmail(req, res);
	}),
);

authRouter.post(
	'/reset-password/:resetPasswordToken',
	expressValidatorMiddleware(resetPasswordAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.resetPassword(req, res);
	}),
);

authRouter.delete(
	'/logout',
	expressValidatorMiddleware(logoutAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.logout(req, res);
	}),
);
