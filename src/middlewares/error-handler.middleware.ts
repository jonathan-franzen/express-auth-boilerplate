import StatusError from '@/errors/status.error.js';
import logger from '@/utils/logger.js';
import { NextFunction, Request, Response } from 'express';

export default function errorHandlerMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
	if (err instanceof StatusError) {
		const json = err.status < 300 ? { message: err.message } : { error: err.message };
		return res.status(err.status).json(json);
	} else {
		logger.alert({
			message: 'Something unexpected happened.',
			context: {
				requestUrl: req.url,
				error: err.message,
				stack: err.stack,
			},
		});
		return res.status(500).json({ message: err.message || 'Internal Server Error.' });
	}
}
