import emailValidator from '@/validators/fragments/email.validator.js';

function postResendVerifyEmailValidator() {
	return [...emailValidator({ optional: false })];
}

export default postResendVerifyEmailValidator;
