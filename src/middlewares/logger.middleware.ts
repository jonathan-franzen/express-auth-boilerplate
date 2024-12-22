import { loggerAsyncStorage } from '@/utils/logger.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';

function loggerMiddleware(): RequestHandler {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		const context = {
			requestPath: req.originalUrl,
			requestSize: req.headers['content-length'] || '',
		};

		await loggerAsyncStorage.run({ context }, async (): Promise<void> => {
			return next();
		});
	};
}

export default loggerMiddleware;
