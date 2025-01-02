import { query, ValidationChain } from 'express-validator';

function pageFragmentValidator(): ValidationChain[] {
	return [query('page').optional().isNumeric().withMessage({ message: 'Page must be numerical.', status: 400 })];
}

export default pageFragmentValidator;
