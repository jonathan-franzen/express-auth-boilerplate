import logger from '@/utils/logger.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { checkExact, Result, ValidationChain, ValidationError, validationResult } from 'express-validator';

function expressValidatorMiddleware(validators: ValidationChain[]): RequestHandler {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
			message: 'Request did not pass validation.',
			context: {
				error: firstError?.msg.message,
				url: req.baseUrl + req.url,
				params: JSON.stringify(req.params),
				queryParams: JSON.stringify(req.query),
			},
		});
		res.status(firstError.msg.status).json({ error: firstError.msg.message });
	};
}

export default expressValidatorMiddleware;
