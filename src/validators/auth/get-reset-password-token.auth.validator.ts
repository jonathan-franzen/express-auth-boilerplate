import resetPasswordTokenFragmentValidator from '@/validators/fragments/reset-password-token.fragment.validator.js';

function getResetPasswordTokenAuthValidator() {
	return [...resetPasswordTokenFragmentValidator()];
}

export default getResetPasswordTokenAuthValidator;
