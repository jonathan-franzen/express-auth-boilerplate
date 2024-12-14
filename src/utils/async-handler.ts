import AsyncMiddlewareExpressInterface from '@/interfaces/express/async-middleware.express.interface.js';
import { NextFunction, Request, Response } from 'express';

// Make sure to catch errors and send to next
export default function asyncHandler(fn: AsyncMiddlewareExpressInterface): AsyncMiddlewareExpressInterface {
	return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
		Promise.resolve(fn(req, res, next)).catch((err) => next(err));
	};
}
