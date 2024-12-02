import { UserRequestExpressInterface } from '@/interfaces/express/user-request.express.interface.js';
import { NextFunction, Response } from 'express';

export interface UserSyncMiddlewareExpressInterface {
	(req: UserRequestExpressInterface, res: Response, next: NextFunction): void | Response;
}
