import { param } from 'express-validator';

function resetPasswordTokenFragmentValidator() {
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

export default resetPasswordTokenFragmentValidator;
