import logger from '@/utils/logger.js';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export default function errorHandlerMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
	if (err instanceof HttpError) {
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
