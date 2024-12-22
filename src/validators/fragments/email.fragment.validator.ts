import { body, ValidationChain } from 'express-validator';

function emailFragmentValidator({ optional }: { optional: boolean }): ValidationChain[] {
	return [
		body('email')
			.optional(optional)
			.exists()
			.withMessage({ message: 'Email is required.', status: 400 })
			.isEmail()
			.withMessage({ message: 'Not a valid email address.', status: 400 })
			.trim(),
	];
}

export default emailFragmentValidator;
