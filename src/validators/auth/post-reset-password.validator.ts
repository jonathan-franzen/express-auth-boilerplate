import passwordValidator from '@/validators/fragments/password.validator.js';
import resetPasswordTokenValidator from '@/validators/fragments/reset-password-token.validator.js';
import { ValidationChain } from 'express-validator';

function postResetPasswordValidator(): ValidationChain[] {
	return [...resetPasswordTokenValidator(), ...passwordValidator({ includeStrongCheck: true, key: 'newPassword' })];
}

export default postResetPasswordValidator;
