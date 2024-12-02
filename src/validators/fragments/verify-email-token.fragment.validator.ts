import { param, ValidationChain } from 'express-validator';

export function verifyEmailTokenFragmentValidator(): ValidationChain[] {
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
