import verifyEmailTokenFragmentValidator from '@/validators/fragments/verify-email-token.fragment.validator.js';

function postVerifyEmailTokenAuthValidator() {
	return [...verifyEmailTokenFragmentValidator()];
}

export default postVerifyEmailTokenAuthValidator;
