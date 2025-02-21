import idFragmentValidator from '@/validators/fragments/id.fragment.validator.js';

function deleteIdUserValidator() {
	return [...idFragmentValidator()];
}

export default deleteIdUserValidator;
