import { UserRequestExpressInterface } from '@/interfaces/express/express.interfaces.js';
import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

function verifyRolesMiddleware(...allowedRoles: Role[]): (req: Request, res: Response, next: NextFunction) => void {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!(req as UserRequestExpressInterface).user?.roles) {
			res.status(403).json({ error: 'Unauthorized.' });
		}

		const rolesArray = [...allowedRoles];
		const canAccess = (req as UserRequestExpressInterface).user?.roles.some((role: Role): boolean => rolesArray.includes(role));

		if (!canAccess) {
			res.status(403).json({ error: 'Unauthorized.' });
		}

		return next();
	};
}

export default verifyRolesMiddleware;
