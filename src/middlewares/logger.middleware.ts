import { AsyncMiddlewareExpressInterface } from '@/interfaces/express/async-middleware.express.interface.js';
import { loggerAsyncStorage } from '@/utils/logger.js';
import { NextFunction, Request, Response } from 'express';

export function loggerMiddleware(): AsyncMiddlewareExpressInterface {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		const context = {
			requestPath: req.originalUrl,
		};

		await loggerAsyncStorage.run({ context }, async (): Promise<void> => {
			next();
		});
	};
}
