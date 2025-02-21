import authController from '@/controllers/auth/index.js';
import expressValidatorMiddleware from '@/middlewares/express-validator.middleware.js';
import deleteLogoutValidator from '@/validators/auth/delete-logout.validator.js';
import getResetPasswordTokenValidValidator from '@/validators/auth/get-reset-password-token-valid.validator.js';
import postLoginValidator from '@/validators/auth/post-login.validator.js';
import postRefreshValidator from '@/validators/auth/post-refresh.validator.js';
import postRegisterValidator from '@/validators/auth/post-register.validator.js';
import postResendVerifyEmailValidator from '@/validators/auth/post-resend-verify-email.validator.js';
import postResetPasswordValidator from '@/validators/auth/post-reset-password.validator.js';
import postSendResetPasswordEmailValidator from '@/validators/auth/post-send-reset-password-email.validator.js';
import postVerifyEmailValidator from '@/validators/auth/post-verify-email.validator.js';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const authRouter = express.Router();

authRouter.post(
	'/register',
	expressValidatorMiddleware(postRegisterValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postRegister(req, res);
	}),
);

authRouter.post(
	'/verify-email/:verifyEmailToken',
	expressValidatorMiddleware(postVerifyEmailValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postVerifyEmail(req, res);
	}),
);

authRouter.post(
	'/resend-verify-email',
	expressValidatorMiddleware(postResendVerifyEmailValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postResendVerifyEmail(req, res);
	}),
);

authRouter.post(
	'/login',
	expressValidatorMiddleware(postLoginValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postLogin(req, res);
	}),
);

authRouter.post(
	'/refresh',
	expressValidatorMiddleware(postRefreshValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postRefresh(req, res);
	}),
);

authRouter.post(
	'/reset-password',
	expressValidatorMiddleware(postSendResetPasswordEmailValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postSendResetPasswordEmail(req, res);
	}),
);

authRouter.get(
	'/reset-password/:resetPasswordToken',
	expressValidatorMiddleware(getResetPasswordTokenValidValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.getResetPasswordTokenValid(req, res);
	}),
);

authRouter.post(
	'/reset-password/:resetPasswordToken',
	expressValidatorMiddleware(postResetPasswordValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.postResetPassword(req, res);
	}),
);

authRouter.delete(
	'/logout',
	expressValidatorMiddleware(deleteLogoutValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.deleteLogout(req, res);
	}),
);

export default authRouter;
