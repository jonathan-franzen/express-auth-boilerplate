import emailValidator from '@/validators/fragments/email.validator.js';
import { ValidationChain } from 'express-validator';

function postResendVerifyEmailValidator(): ValidationChain[] {
	return [...emailValidator({ optional: false })];
}

export default postResendVerifyEmailValidator;
