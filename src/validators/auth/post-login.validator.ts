import emailValidator from '@/validators/fragments/email.validator.js';
import passwordValidator from '@/validators/fragments/password.validator.js';
import { ValidationChain } from 'express-validator';

function postLoginValidator(): ValidationChain[] {
	return [...emailValidator({ optional: false }), ...passwordValidator({ includeStrongCheck: false })];
}

export default postLoginValidator;
