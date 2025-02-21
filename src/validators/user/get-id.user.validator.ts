import idFragmentValidator from '@/validators/fragments/id.fragment.validator.js';

function getIdUserValidator() {
	return [...idFragmentValidator()];
}

export default getIdUserValidator;
