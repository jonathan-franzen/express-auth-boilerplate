import { query, ValidationChain } from 'express-validator';

function filtersFragmentValidator({ allowedFiltersKeys }: { allowedFiltersKeys: string[] }): ValidationChain[] {
	return [
		query('filters')
			.optional()
			.custom((filter: string): boolean => {
				let parsedFilter;
				try {
					parsedFilter = JSON.parse(filter);
				} catch (err) {
					throw new Error();
				}

				if (typeof parsedFilter !== 'object' || parsedFilter === null) {
					throw new Error();
				}

				const invalidKeys = Object.keys(parsedFilter).filter((key: string): boolean => !allowedFiltersKeys.includes(key));

				if (invalidKeys.length > 0) {
					throw new Error();
				}

				return true;
			})
			.withMessage((value: string): { message: string; status: number } | void => {
				try {
					const parsedFilter = JSON.parse(value);
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

export default filtersFragmentValidator;
