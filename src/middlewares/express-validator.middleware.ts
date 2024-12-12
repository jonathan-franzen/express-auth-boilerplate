import AsyncMiddlewareExpressInterface from '@/interfaces/express/async-middleware.express.interface.js';
import logger from '@/utils/logger.js';
import { NextFunction, Request, Response } from 'express';
import { checkExact, Result, ValidationChain, ValidationError, validationResult } from 'express-validator';

export default function expressValidatorMiddleware(validators: ValidationChain[]): AsyncMiddlewareExpressInterface {
	return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
		// Throw an error if there are too many fields in the request
		await checkExact(validators, {
			message: { message: 'Too many fields specified.', status: 400 },
		}).run(req);

		const errors: Result<ValidationError> = validationResult(req);

		// Continue if no errors
		if (errors.isEmpty()) {
			return next();
		}

		const firstError: ValidationError = errors.array().at(0)!;

		logger.warning({
			message: `Request did not pass validation.`,
			context: {
				error: firstError?.msg.message,
				url: req.baseUrl + req.url,
				params: JSON.stringify(req.params),
				queryParams: JSON.stringify(req.query),
			},
		});
		return res.status(firstError.msg.status).json({ message: firstError.msg.message });
	};
}
