import verifyEmailTokenValidator from '@/validators/fragments/verify-email-token.validator.js';

function postVerifyEmailValidator() {
	return [...verifyEmailTokenValidator()];
}

export default postVerifyEmailValidator;
