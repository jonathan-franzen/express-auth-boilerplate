import { query } from 'express-validator';

function sortOrderFragmentValidator() {
	return [query('sortOrder').optional().isIn(['asc', 'desc']).withMessage({ message: 'Sort order invalid. Value must be "asc" or "desc".', status: 400 })];
}

export default sortOrderFragmentValidator;
