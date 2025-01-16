import passwordFragmentValidator from '@/validators/fragments/password.fragment.validator.js';
import resetPasswordTokenFragmentValidator from '@/validators/fragments/reset-password-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postResetPasswordTokenAuthValidator(): ValidationChain[] {
	return [...resetPasswordTokenFragmentValidator(), ...passwordFragmentValidator({ key: 'newPassword', includeStrongCheck: true })];
}

export default postResetPasswordTokenAuthValidator;
