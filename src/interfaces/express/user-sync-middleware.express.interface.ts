import { Response, NextFunction } from 'express';
import { UserRequestExpressInterface } from '@/interfaces/express/user-request.express.interface.js';

export interface UserSyncMiddlewareExpressInterface {
	(
		req: UserRequestExpressInterface,
		res: Response,
		next: NextFunction,
	): void | Response;
}
