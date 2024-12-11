import { StatusError } from '@/errors/status.error.js';
import { ErrorHandlerMiddlewareExpressInterface } from '@/interfaces/express/error-handler-middleware.express.interface.js';
import logger from '@/utils/logger.js';
import { Request, Response } from 'express';

export const errorHandlerMiddleware: ErrorHandlerMiddlewareExpressInterface = (err: Error, req: Request, res: Response): Response | void => {
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
};
