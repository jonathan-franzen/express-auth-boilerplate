import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postResetPasswordAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator({ optional: false })];
}

export default postResetPasswordAuthValidator;
