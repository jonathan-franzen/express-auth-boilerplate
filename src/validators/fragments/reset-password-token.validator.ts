import { param, ValidationChain } from 'express-validator';

function resetPasswordTokenValidator(): ValidationChain[] {
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

export default resetPasswordTokenValidator;
