import express, { Router } from 'express';
import { userController } from '@/controllers/user/index.js';
import { Role } from '@prisma/client';
import { UserSyncMiddlewareExpressInterface } from '@/interfaces/express/user-sync-middleware.express.interface.js';
import { expressValidatorMiddleware } from '@/middlewares/express-validator.middleware.js';
import { getByIdUserValidator } from '@/validators/user/get-by-id.user.validator.js';
import { verifyRolesMiddleware } from '@/middlewares/verify-roles.middleware.js';
import { deleteByIdUserValidator } from '@/validators/user/delete-by-id.user.validator.js';

export const userRouter: Router = express.Router();

userRouter.get(
	'/',
	(): UserSyncMiddlewareExpressInterface => verifyRolesMiddleware(Role.ADMIN),
	userController.getAllUsers,
);

userRouter.delete(
	'/:id',
	expressValidatorMiddleware(deleteByIdUserValidator()),
	(): UserSyncMiddlewareExpressInterface => verifyRolesMiddleware(Role.ADMIN),
	userController.deleteUser,
);

userRouter.get(
	'/:id',
	expressValidatorMiddleware(getByIdUserValidator()),
	(): UserSyncMiddlewareExpressInterface => verifyRolesMiddleware(Role.ADMIN),
	userController.getUserById,
);
