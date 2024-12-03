import { UserRequestExpressInterface } from '@/interfaces/express/user-request.express.interface.js';
import { NextFunction, Response } from 'express';

export interface UserAsyncMiddlewareExpressInterface {
	(req: UserRequestExpressInterface, res: Response, next: NextFunction): Promise<void | Response>;
}
