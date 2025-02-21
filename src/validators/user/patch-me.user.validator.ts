import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';
import firstNameFragmentValidator from '@/validators/fragments/first-name.fragment.validator.js';
import lastNameFragmentValidator from '@/validators/fragments/last-name.fragment.validator.js';

function patchMeUserValidator() {
	return [...emailFragmentValidator({ optional: true }), ...firstNameFragmentValidator({ optional: true }), ...lastNameFragmentValidator({ optional: true })];
}

export default patchMeUserValidator;
