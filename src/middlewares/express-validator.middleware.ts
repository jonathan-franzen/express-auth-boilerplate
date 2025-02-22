import logger from '@/utils/logger.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { checkExact, ValidationChain, validationResult } from 'express-validator';

function expressValidatorMiddleware(validators: ValidationChain[]): RequestHandler {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Throw an error if there are too many fields in the request
		await checkExact(validators, {
			message: { message: 'Too many fields specified.', status: 400 },
		}).run(req);

		const errors = validationResult(req);

		// Continue if no errors
		if (errors.isEmpty()) {
			return next();
		}

		const firstError = errors.array().at(0)!.msg as { message: string; status: number };

		logger.warning({
			context: {
				error: firstError.message,
				params: JSON.stringify(req.params),
				queryParams: JSON.stringify(req.query),
				url: req.baseUrl + req.url,
			},
			message: 'Request did not pass validation.',
		});
		res.status(firstError.status).json({ error: firstError.message });
	};
}

export default expressValidatorMiddleware;
