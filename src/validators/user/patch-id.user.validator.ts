import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';
import firstNameFragmentValidator from '@/validators/fragments/first-name.fragment.validator.js';
import idFragmentValidator from '@/validators/fragments/id.fragment.validator.js';
import lastNameFragmentValidator from '@/validators/fragments/last-name.fragment.validator.js';

function patchIdUserValidator() {
	return [
		...idFragmentValidator(),
		...emailFragmentValidator({ optional: true }),
		...firstNameFragmentValidator({ optional: true }),
		...lastNameFragmentValidator({ optional: true }),
	];
}

export default patchIdUserValidator;
