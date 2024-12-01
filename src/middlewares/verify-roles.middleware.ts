import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { UserRequestExpressInterface } from '@/interfaces/express/user-request.express.interface.js';
import { UserSyncMiddlewareExpressInterface } from '@/interfaces/express/user-sync-middleware.express.interface.js';

export function verifyRolesMiddleware(
	...allowedRoles: Role[]
): UserSyncMiddlewareExpressInterface {
	return (
		req: UserRequestExpressInterface,
		res: Response,
		next: NextFunction,
	): Response | void => {
		if (!req?.user?.roles) {
			return res.sendStatus(401);
		}

		const rolesArray: Role[] = [...allowedRoles];
		const canAccess: boolean = req.user.roles.some((role: Role): boolean =>
			rolesArray.includes(role),
		);

		if (!canAccess) {
			return res.sendStatus(401);
		}

		next();
	};
}
