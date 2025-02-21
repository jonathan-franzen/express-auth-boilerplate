import resetPasswordTokenValidator from '@/validators/fragments/reset-password-token.validator.js';

function getResetPasswordTokenValidValidator() {
	return [...resetPasswordTokenValidator()];
}

export default getResetPasswordTokenValidValidator;
