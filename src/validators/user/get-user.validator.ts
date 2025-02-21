import idValidator from '@/validators/fragments/id.validator.js';

function getUserValidator() {
	return [...idValidator()];
}

export default getUserValidator;
