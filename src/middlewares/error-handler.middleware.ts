import StatusError from '@/errors/status.error.js';
import logger from '@/utils/logger.js';
import { Request, Response } from 'express';

export default function errorHandlerMiddleware(err: Error, req: Request, res: Response): Response | void {
	if (err instanceof StatusError) {
		return res.status(err.status).json({ error: err.message });
	} else {
		logger.alert({
			message: 'Something unexpected happened.',
			context: {
				requestUrl: req.url,
				error: err.message,
				stack: err.stack,
			},
		});
		return res.status(500).json({ error: 'Internal Server Error.' });
	}
}
