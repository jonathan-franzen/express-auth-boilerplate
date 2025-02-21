import passwordFragmentValidator from '@/validators/fragments/password.fragment.validator.js';
import resetPasswordTokenFragmentValidator from '@/validators/fragments/reset-password-token.fragment.validator.js';

function postResetPasswordTokenAuthValidator() {
	return [...resetPasswordTokenFragmentValidator(), ...passwordFragmentValidator({ includeStrongCheck: true, key: 'newPassword' })];
}

export default postResetPasswordTokenAuthValidator;
