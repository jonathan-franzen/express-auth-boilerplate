import { StatusCodeError } from '@/errors/status-code.error.js';
import { ErrorHandlerMiddlewareExpressInterface } from '@/interfaces/express/error-handler-middleware.express.interface.js';
import logger from '@/utils/logger.js';
import { Request, Response } from 'express';

export const errorHandlerMiddleware: ErrorHandlerMiddlewareExpressInterface = (err: Error, req: Request, res: Response): Response | void => {
	if (err instanceof StatusCodeError) {
		return res.status(err.statusCode).json({ message: err.message });
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
};
