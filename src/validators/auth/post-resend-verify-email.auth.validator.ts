import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';

function postResendVerifyEmailAuthValidator() {
	return [...emailFragmentValidator({ optional: false })];
}

export default postResendVerifyEmailAuthValidator;
