import { ValidationChain } from 'express-validator';
import { resetPasswordTokenFragmentValidator } from '@/validators/fragments/reset-password-token.fragment.validator.js';

export function resetPasswordAuthValidator(): ValidationChain[] {
	return [...resetPasswordTokenFragmentValidator()];
}
