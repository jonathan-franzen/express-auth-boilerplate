import { query } from 'express-validator';

function limitValidator() {
	return [query('limit').optional().isNumeric().withMessage({ message: 'Limit must be numerical.', status: 400 })];
}

export default limitValidator;
