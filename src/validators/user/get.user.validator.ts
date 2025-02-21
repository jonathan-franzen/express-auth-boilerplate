import filtersFragmentValidator from '@/validators/fragments/filters.fragment.validator.js';
import limitFragmentValidator from '@/validators/fragments/limit.fragment.validator.js';
import pageFragmentValidator from '@/validators/fragments/page.fragment.validator.js';
import sortByFragmentValidator from '@/validators/fragments/sort-by.fragment.validator.js';
import sortOrderFragmentValidator from '@/validators/fragments/sort-order.fragment.validator.js';

function getUserValidator() {
	const allowedFiltersKeys = ['email'];
	const allowedSortBy = ['createdAt', 'firstName', 'lastName'];

	return [
		...pageFragmentValidator(),
		...limitFragmentValidator(),
		...filtersFragmentValidator({ allowedFiltersKeys }),
		...sortByFragmentValidator({ allowedSortBy }),
		...sortOrderFragmentValidator(),
	];
}

export default getUserValidator;
