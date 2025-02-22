import { param, ValidationChain } from 'express-validator';

function verifyEmailTokenValidator(): ValidationChain[] {
	return [
		param('verifyEmailToken')
			.exists()
			.withMessage({
				message: 'Email verification token is required.',
				status: 400,
			})
			.isString()
			.withMessage({
				message: 'Email verification token must be a string.',
				status: 400,
			}),
	];
}

export default verifyEmailTokenValidator;
