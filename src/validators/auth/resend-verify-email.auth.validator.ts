import { ValidationChain } from 'express-validator';
import { emailFragmentValidator } from '@/validators/fragments/email.fragment.validator.js';

export function resendVerifyEmailAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator()];
}
