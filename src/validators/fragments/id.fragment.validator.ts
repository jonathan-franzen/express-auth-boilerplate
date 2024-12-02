import { param, ValidationChain } from 'express-validator';

export function idFragmentValidator(): ValidationChain[] {
	return [
		param('id').exists().withMessage({ message: 'ID is required.', status: 400 }).isString().withMessage({ message: 'ID must be a string.', status: 400 }),
	];
}
