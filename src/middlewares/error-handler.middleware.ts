import logger from '@/utils/logger.js';
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';

function errorHandlerMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): Response {
	if (createError.isHttpError(err)) {
		return res.status(err.status).json({ error: err.message });
	} else {
		logger.alert({
			message: 'Internal Server Error.',
			context: {
				requestUrl: req.url,
				error: err.message,
				stack: err.stack,
			},
		});

		return res.status(500).json({ error: 'Internal Server Error.' });
	}
}

export default errorHandlerMiddleware;
