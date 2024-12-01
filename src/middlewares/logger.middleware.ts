import { Request, Response, NextFunction } from 'express';
import { loggerAsyncStorage } from '@/utils/logger.js';
import { AsyncMiddlewareExpressInterface } from '@/interfaces/express/async-middleware.express.interface.js';

export function loggerMiddleware(): AsyncMiddlewareExpressInterface {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction,
	): Promise<void> => {
		const context = {
			requestPath: req.originalUrl,
		};

		await loggerAsyncStorage.run({ context }, async (): Promise<void> => {
			next();
		});
	};
}
