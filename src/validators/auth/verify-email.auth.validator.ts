import { ValidationChain } from 'express-validator';
import { verifyEmailTokenFragmentValidator } from '@/validators/fragments/verify-email-token.fragment.validator.js';

export function verifyEmailAuthValidator(): ValidationChain[] {
	return [...verifyEmailTokenFragmentValidator()];
}
