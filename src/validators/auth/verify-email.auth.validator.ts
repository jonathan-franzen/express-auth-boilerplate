import { verifyEmailTokenFragmentValidator } from '@/validators/fragments/verify-email-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function verifyEmailAuthValidator(): ValidationChain[] {
	return [...verifyEmailTokenFragmentValidator()];
}
