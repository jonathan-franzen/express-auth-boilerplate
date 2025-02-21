import authController from '@/controllers/auth/index.js';
import expressValidatorMiddleware from '@/middlewares/express-validator.middleware.js';
import deleteLogoutAuthValidator from '@/validators/auth/delete-logout.auth.validator.js';
import getResetPasswordTokenAuthValidator from '@/validators/auth/get-reset-password-token.auth.validator.js';
import postLoginAuthValidator from '@/validators/auth/post-login.auth.validator.js';
import postRefreshAuthValidator from '@/validators/auth/post-refresh.auth.validator.js';
import postRegisterAuthValidator from '@/validators/auth/post-register.auth.validator.js';
import postResendVerifyEmailAuthValidator from '@/validators/auth/post-resend-verify-email.auth.validator.js';
import postResetPasswordTokenAuthValidator from '@/validators/auth/post-reset-password-token.auth.validator.js';
import postResetPasswordAuthValidator from '@/validators/auth/post-reset-password.auth.validator.js';
import postVerifyEmailTokenAuthValidator from '@/validators/auth/post-verify-email-token.auth.validator.js';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const authRouter = express.Router();

authRouter.post(
	'/register',
	expressValidatorMiddleware(postRegisterAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postRegister(req, res);
	}),
);

authRouter.post(
	'/verify-email/:verifyEmailToken',
	expressValidatorMiddleware(postVerifyEmailTokenAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postVerifyEmail(req, res);
	}),
);

authRouter.post(
	'/resend-verify-email',
	expressValidatorMiddleware(postResendVerifyEmailAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postResendVerifyEmail(req, res);
	}),
);

authRouter.post(
	'/login',
	expressValidatorMiddleware(postLoginAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postLogin(req, res);
	}),
);

authRouter.post(
	'/refresh',
	expressValidatorMiddleware(postRefreshAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postRefresh(req, res);
	}),
);

authRouter.post(
	'/reset-password',
	expressValidatorMiddleware(postResetPasswordAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postSendResetPasswordEmail(req, res);
	}),
);

authRouter.get(
	'/reset-password/:resetPasswordToken',
	expressValidatorMiddleware(getResetPasswordTokenAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.getVerifyResetPasswordToken(req, res);
	}),
);

authRouter.post(
	'/reset-password/:resetPasswordToken',
	expressValidatorMiddleware(postResetPasswordTokenAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postResetPassword(req, res);
	}),
);

authRouter.delete(
	'/logout',
	expressValidatorMiddleware(deleteLogoutAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.deleteLogout(req, res);
	}),
);

export default authRouter;
