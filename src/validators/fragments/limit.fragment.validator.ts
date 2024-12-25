import { body, ValidationChain } from 'express-validator';

function limitFragmentValidator(): ValidationChain[] {
	return [body('limit').optional().isNumeric().withMessage({ message: 'Limit must be numerical.', status: 400 })];
}

export default limitFragmentValidator;
