import { query, ValidationChain } from 'express-validator';

function sortOrderValidator(): ValidationChain[] {
	return [query('sortOrder').optional().isIn(['asc', 'desc']).withMessage({ message: 'Sort order invalid. Value must be "asc" or "desc".', status: 400 })];
}

export default sortOrderValidator;
