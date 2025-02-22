import { param, ValidationChain } from 'express-validator';

function idValidator(): ValidationChain[] {
	return [
		param('id').exists().withMessage({ message: 'ID is required.', status: 400 }).isString().withMessage({ message: 'ID must be a string.', status: 400 }),
	];
}

export default idValidator;
