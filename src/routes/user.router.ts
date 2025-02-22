import userController from '@/controllers/user/index.js';
import { UserRequestExpressInterface } from '@/interfaces/express/express.interfaces.js';
import expressValidatorMiddleware from '@/middlewares/express-validator.middleware.js';
import verifyRolesMiddleware from '@/middlewares/verify-roles.middleware.js';
import deleteUserValidator from '@/validators/user/delete-user.validator.js';
import getUserValidator from '@/validators/user/get-user.validator.js';
import getUsersValidator from '@/validators/user/get-users.validator.js';
import patchMeValidator from '@/validators/user/patch-me.validator.js';
import patchUserValidator from '@/validators/user/patch-user.validator.js';
import postMeUpdatePasswordValidator from '@/validators/user/post-me-update-password.validator.js';
import { Role } from '@prisma/client';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.get(
	'/me',
	asyncHandler((req: Request, res: Response): void => {
		userController.getMe(req as UserRequestExpressInterface, res);
	}),
);

userRouter.patch(
	'/me',
	expressValidatorMiddleware(patchMeValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.patchMe(req as UserRequestExpressInterface, res);
	}),
);

userRouter.post(
	'/me/update-password',
	expressValidatorMiddleware(postMeUpdatePasswordValidator()),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.postMeUpdatePassword(req as UserRequestExpressInterface, res);
	}),
);

userRouter.get(
	'/',
	expressValidatorMiddleware(getUsersValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getUsers(req, res);
	}),
);

userRouter.get(
	'/:id',
	expressValidatorMiddleware(getUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getUser(req, res);
	}),
);

userRouter.patch(
	'/:id',
	expressValidatorMiddleware(patchUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.patchUser(req, res);
	}),
);

userRouter.delete(
	'/:id',
	expressValidatorMiddleware(deleteUserValidator()),
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.deleteUser(req as UserRequestExpressInterface, res);
	}),
);

export default userRouter;
