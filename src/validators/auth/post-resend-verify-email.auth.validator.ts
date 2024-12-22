import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postResendVerifyEmailAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator({ optional: false })];
}

export default postResendVerifyEmailAuthValidator;
