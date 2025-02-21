import passwordValidator from '@/validators/fragments/password.validator.js';
import resetPasswordTokenValidator from '@/validators/fragments/reset-password-token.validator.js';

function postResetPasswordValidator() {
	return [...resetPasswordTokenValidator(), ...passwordValidator({ includeStrongCheck: true, key: 'newPassword' })];
}

export default postResetPasswordValidator;
