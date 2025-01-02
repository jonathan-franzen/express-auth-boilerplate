import { query, ValidationChain } from 'express-validator';

function sortByFragmentValidator({ allowedSortBy }: { allowedSortBy: string[] }): ValidationChain[] {
	return [
		query('sortBy')
			.optional()
			.isIn(allowedSortBy)
			.withMessage({ message: `Sort by invalid. Value must be in ${allowedSortBy}.`, status: 400 }),
	];
}

export default sortByFragmentValidator;
