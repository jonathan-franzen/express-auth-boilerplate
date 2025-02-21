import { query } from 'express-validator';

function pageFragmentValidator() {
	return [query('page').optional().isNumeric().withMessage({ message: 'Page must be numerical.', status: 400 })];
}

export default pageFragmentValidator;
