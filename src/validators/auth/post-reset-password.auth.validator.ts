import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';

function postResetPasswordAuthValidator() {
	return [...emailFragmentValidator({ optional: false })];
}

export default postResetPasswordAuthValidator;
