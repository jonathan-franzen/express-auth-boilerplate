import { emailFragmentValidator } from '@/validators/fragments/email.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function resendVerifyEmailAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator({ optional: false })];
}
