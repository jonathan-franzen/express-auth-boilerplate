import { resetPasswordTokenFragmentValidator } from '@/validators/fragments/reset-password-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function resetPasswordAuthValidator(): ValidationChain[] {
	return [...resetPasswordTokenFragmentValidator()];
}
