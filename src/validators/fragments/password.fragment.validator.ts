import { body, ValidationChain } from 'express-validator';

export function passwordFragmentValidator(): ValidationChain[] {
	return [
		body('password')
			.exists()
			.withMessage({ message: 'Password is required.', status: 400 })
			.isString()
			.withMessage({ message: 'Password must be a string.', status: 400 })
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 0,
			})
			.withMessage({
				message:
					'Password must contain at least one uppercase letter, one number, and be at least 8 characters long.',
				status: 400,
			}),
	];
}
