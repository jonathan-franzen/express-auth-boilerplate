import { body, ValidationChain } from 'express-validator';

function passwordFragmentValidator({ key, includeStrongCheck }: { key?: string; includeStrongCheck: boolean }): ValidationChain[] {
	return [
		body(key || 'password')
			.exists()
			.withMessage({ message: 'Password is required.', status: 400 })
			.isString()
			.withMessage({ message: 'Password must be a string.', status: 400 })
			.if((): boolean => includeStrongCheck)
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 0,
			})
			.withMessage({
				message: 'Password must contain at least one uppercase letter, one number, and be at least 8 characters long.',
				status: 400,
			}),
	];
}

export default passwordFragmentValidator;
