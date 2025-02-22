import { query, ValidationChain } from 'express-validator';

function filtersValidator({ allowedFiltersKeys }: { allowedFiltersKeys: string[] }): ValidationChain[] {
	return [
		query('filters')
			.optional()
			.custom((filter: string): boolean => {
				let parsedFilter;
				try {
					parsedFilter = JSON.parse(filter) as Record<string, unknown>;
				} catch {
					throw new Error('Filter must be a valid JSON string.');
				}

				if (typeof parsedFilter !== 'object' || parsedFilter === null) {
					throw new Error('Filter must be a valid object.');
				}

				const invalidKeys = Object.keys(parsedFilter).filter((key: string): boolean => !allowedFiltersKeys.includes(key));

				if (invalidKeys.length > 0) {
					throw new Error('Invalid filter keys: ' + invalidKeys.join(', ') + '. Allowed keys are: ' + allowedFiltersKeys.join(', ') + '.');
				}

				return true;
			})
			.withMessage((value: string): void | { message: string; status: number } => {
				try {
					const parsedFilter = JSON.parse(value) as Record<string, unknown>;
					if (typeof parsedFilter !== 'object' || parsedFilter === null) {
						return { message: 'Filter must be a valid object.', status: 400 };
					}

					const invalidKeys = Object.keys(parsedFilter).filter((key: string): boolean => !allowedFiltersKeys.includes(key));
					if (invalidKeys.length > 0) {
						return {
							message: `Invalid filter keys: ${invalidKeys.join(', ')}. Allowed keys are: ${allowedFiltersKeys.join(', ')}.`,
							status: 400,
						};
					}
				} catch {
					return { message: 'Filter must be a valid JSON string.', status: 400 };
				}
			}),
	];
}

export default filtersValidator;
