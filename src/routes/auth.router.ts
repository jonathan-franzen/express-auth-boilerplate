import express, { Request, Response, Router } from 'express';
import { authController } from '@/controllers/auth/index.js';
import { expressValidatorMiddleware } from '@/middlewares/express-validator.middleware.js';
import { registerAuthValidator } from '@/validators/auth/register.auth.validator.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { refreshAuthValidator } from '@/validators/auth/refresh.auth.validator.js';
import { loginAuthValidator } from '@/validators/auth/login.auth.validator.js';

export const authRouter: Router = express.Router();

authRouter.post(
	'/register',
	expressValidatorMiddleware(registerAuthValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.register(req, res);
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

authRouter.delete(
	'/logout',
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await authController.logout(req, res);
	}),
);
