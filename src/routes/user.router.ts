import userController from '@/controllers/user/index.js';
import UserRequestExpressInterface from '@/interfaces/express/user-request.express.interface.js';
import expressValidatorMiddleware from '@/middlewares/express-validator.middleware.js';
import verifyRolesMiddleware from '@/middlewares/verify-roles.middleware.js';
import asyncHandler from '@/utils/async-handler.js';
import deleteIdUserValidator from '@/validators/user/delete-id.user.validator.js';
import getIdUserValidator from '@/validators/user/get-id.user.validator.js';
import patchMeUserValidator from '@/validators/user/patch-me.user.validator.js';
import { Role } from '@prisma/client';
import express, { Request, Response, Router } from 'express';

const userRouter: Router = express.Router();

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

userRouter.get(
	'/',
	// @ts-ignore
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getAllUsers(req, res);
	}),
);

userRouter.get(
	'/:id',
	expressValidatorMiddleware(getIdUserValidator()),
	// @ts-ignore
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.getUserById(req, res);
	}),
);

userRouter.delete(
	'/:id',
	expressValidatorMiddleware(deleteIdUserValidator()),
	// @ts-ignore
	verifyRolesMiddleware(Role.ADMIN),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		await userController.deleteUser(req, res);
	}),
);

export default userRouter;
