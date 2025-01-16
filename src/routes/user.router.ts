import userController from '@/controllers/user/index.js';
import UserRequestExpressInterface from '@/interfaces/express/user-request.express.interface.js';
import expressValidatorMiddleware from '@/middlewares/express-validator.middleware.js';
import verifyRolesMiddleware from '@/middlewares/verify-roles.middleware.js';
import deleteIdUserValidator from '@/validators/user/delete-id.user.validator.js';
import getIdUserValidator from '@/validators/user/get-id.user.validator.js';
import getUserValidator from '@/validators/user/get.user.validator.js';
import patchIdUserValidator from '@/validators/user/patch-id.user.validator.js';
import patchMeUserValidator from '@/validators/user/patch-me.user.validator.js';
import postMeResetPasswordUserValidator from '@/validators/user/post-me-reset-password.user.validator.js';
import { Role } from '@prisma/client';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.get(
	'/me',
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getMe(req as UserRequestExpressInterface, res);
	}),
);

userRouter.patch(
	'/me',
	expressValidatorMiddleware(patchMeUserValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.patchMe(req as UserRequestExpressInterface, res);
	}),
);

userRouter.post(
	'/me/reset-password',
	expressValidatorMiddleware(postMeResetPasswordUserValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.postMeResetPassword(req as UserRequestExpressInterface, res);
	}),
);

userRouter.get(
	'/',
	expressValidatorMiddleware(getUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getAllUsers(req, res);
	}),
);

userRouter.get(
	'/:id',
	expressValidatorMiddleware(getIdUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getUser(req, res);
	}),
);

userRouter.patch(
	'/:id',
	expressValidatorMiddleware(patchIdUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.patchUser(req, res);
	}),
);

userRouter.delete(
	'/:id',
	expressValidatorMiddleware(deleteIdUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.deleteUser(req as UserRequestExpressInterface, res);
	}),
);

export default userRouter;
