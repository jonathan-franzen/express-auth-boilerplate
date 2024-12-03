import { body, ValidationChain } from 'express-validator';

export function emailFragmentValidator(): ValidationChain[] {
	return [
		body('email')
			.exists()
			.withMessage({ message: 'Email is required.', status: 400 })
			.isEmail()
			.withMessage({ message: 'Not a valid email address.', status: 400 })
			.trim(),
	];
}
