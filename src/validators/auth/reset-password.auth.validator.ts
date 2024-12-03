import { passwordFragmentValidator } from '@/validators/fragments/password.fragment.validator.js';
import { resetPasswordTokenFragmentValidator } from '@/validators/fragments/reset-password-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function resetPasswordAuthValidator(): ValidationChain[] {
	return [...resetPasswordTokenFragmentValidator(), ...passwordFragmentValidator({ includeStrongCheck: true })];
}
