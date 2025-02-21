import { body } from 'express-validator';

function emailValidator({ optional }: { optional: boolean }) {
	return [
		body('email')
			.optional(optional)
			.exists()
			.withMessage({ message: 'Email is required.', status: 400 })
			.isEmail()
			.withMessage({ message: 'Not a valid email address.', status: 400 })
			.trim()
			.toLowerCase(),
	];
}

export default emailValidator;
