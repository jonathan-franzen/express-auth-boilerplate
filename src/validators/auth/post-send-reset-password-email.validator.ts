import emailValidator from '@/validators/fragments/email.validator.js';
import { ValidationChain } from 'express-validator';

function postSendResetPasswordEmailValidator(): ValidationChain[] {
	return [...emailValidator({ optional: false })];
}

export default postSendResetPasswordEmailValidator;
