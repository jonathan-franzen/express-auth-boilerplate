import { CustomError } from '@/utils/custom-error.js';
import { Request, Response } from 'express';
import logger from '@/utils/logger.js';
import { ErrorHandlerMiddlewareExpressInterface } from '@/interfaces/express/error-handler-middleware.express.interface.js';

export const errorHandlerMiddleware: ErrorHandlerMiddlewareExpressInterface = (
	err: Error,
	req: Request,
	res: Response,
): Response | void => {
	if (err instanceof CustomError) {
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
		return res
			.status(500)
			.json({ message: err.message || 'Internal Server Error.' });
	}
};
