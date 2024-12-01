import { emailFragmentValidator } from '@/validators/fragments/email.fragment.validator.js';
import { passwordFragmentValidator } from '@/validators/fragments/password.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function loginAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator(), ...passwordFragmentValidator()];
}
