import { query } from 'express-validator';

function limitFragmentValidator() {
	return [query('limit').optional().isNumeric().withMessage({ message: 'Limit must be numerical.', status: 400 })];
}

export default limitFragmentValidator;
