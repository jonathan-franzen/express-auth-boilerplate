import { param, ValidationChain } from 'express-validator';

export function resetPasswordTokenFragmentValidator(): ValidationChain[] {
	return [
		param('resetPasswordToken')
			.exists()
			.withMessage({
				message: 'Reset password token is required.',
				status: 400,
			})
			.isString()
			.withMessage({
				message: 'Reset password must be a string.',
				status: 400,
			}),
	];
}
