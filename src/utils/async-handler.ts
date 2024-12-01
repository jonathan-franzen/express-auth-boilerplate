import { NextFunction, Request, Response } from 'express';
import { AsyncMiddlewareExpressInterface } from '@/interfaces/express/async-middleware.express.interface.js';

// Make sure to catch errors and send to next
export function asyncHandler(
	fn: AsyncMiddlewareExpressInterface,
): AsyncMiddlewareExpressInterface {
	return function (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};
}
