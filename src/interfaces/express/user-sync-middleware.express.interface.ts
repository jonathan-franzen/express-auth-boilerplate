import UserRequestExpressInterface from '@/interfaces/express/user-request.express.interface.js';
import { NextFunction, Response } from 'express';

interface UserSyncMiddlewareExpressInterface {
	(req: UserRequestExpressInterface, res: Response, next: NextFunction): void | Response;
}

export default UserSyncMiddlewareExpressInterface;
