import idValidator from '@/validators/fragments/id.validator.js';

function deleteUserValidator() {
	return [...idValidator()];
}

export default deleteUserValidator;
