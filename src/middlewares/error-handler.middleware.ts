import logger from '@/utils/logger.js';
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';

function errorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
	if (createError.isHttpError(err)) {
		res.status(err.status).json({ error: err.message });
	} else {
		logger.alert({
			context: {
				error: err.message,
				requestUrl: req.url,
				stack: err.stack,
			},
			message: 'Internal Server Error.',
		});

		res.status(500).json({ error: 'Internal Server Error.' });
	}
	next();
}

export default errorHandlerMiddleware;
