import filtersValidator from '@/validators/fragments/filters.validator.js';
import limitValidator from '@/validators/fragments/limit.validator.js';
import pageValidator from '@/validators/fragments/page.validator.js';
import sortByValidator from '@/validators/fragments/sort-by.validator.js';
import sortOrderValidator from '@/validators/fragments/sort-order.validator.js';

function getUsersValidator() {
	const allowedFiltersKeys = ['email'];
	const allowedSortBy = ['createdAt', 'firstName', 'lastName'];

	return [...pageValidator(), ...limitValidator(), ...filtersValidator({ allowedFiltersKeys }), ...sortByValidator({ allowedSortBy }), ...sortOrderValidator()];
}

export default getUsersValidator;
