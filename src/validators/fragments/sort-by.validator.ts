import { query, ValidationChain } from 'express-validator';

function sortByValidator({ allowedSortBy }: { allowedSortBy: string[] }): ValidationChain[] {
	return [
		query('sortBy')
			.optional()
			.isIn(allowedSortBy)
			.withMessage({ message: `Sort by invalid. Value must be in ${allowedSortBy.toString()}.`, status: 400 }),
	];
}

export default sortByValidator;
