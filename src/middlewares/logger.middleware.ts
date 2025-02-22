import { loggerAsyncStorage } from '@/utils/logger.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';

function loggerMiddleware(): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const context = {
			requestPath: req.originalUrl,
			requestSize: req.headers['content-length'] || '',
		};

		loggerAsyncStorage.run({ context }, (): void => {
			return next();
		});
	};
}

export default loggerMiddleware;
