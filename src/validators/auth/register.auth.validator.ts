import { emailFragmentValidator } from '@/validators/fragments/email.fragment.validator.js';
import { firstNameFragmentValidator } from '@/validators/fragments/first-name.fragment.validator.js';
import { lastNameFragmentValidator } from '@/validators/fragments/last-name.fragment.validator.js';
import { passwordFragmentValidator } from '@/validators/fragments/password.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function registerAuthValidator(): ValidationChain[] {
	return [
		...emailFragmentValidator(),
		...passwordFragmentValidator({ includeStrongCheck: true }),
		...firstNameFragmentValidator(),
		...lastNameFragmentValidator(),
	];
}
