import { ValidationChain } from 'express-validator';
import { emailFragmentValidator } from '@/validators/fragments/email.fragment.validator.js';

export function sendResetPasswordEmailAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator()];
}
