import emailValidator from '@/validators/fragments/email.validator.js';

function postSendResetPasswordEmailValidator() {
	return [...emailValidator({ optional: false })];
}

export default postSendResetPasswordEmailValidator;
