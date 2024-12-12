import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export default function postResendVerifyEmailAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator({ optional: false })];
}
