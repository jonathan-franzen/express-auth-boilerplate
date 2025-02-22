import emailValidator from '@/validators/fragments/email.validator.js';
import firstNameValidator from '@/validators/fragments/first-name.validator.js';
import lastNameValidator from '@/validators/fragments/last-name.validator.js';
import { ValidationChain } from 'express-validator';

function patchMeValidator(): ValidationChain[] {
	return [...emailValidator({ optional: true }), ...firstNameValidator({ optional: true }), ...lastNameValidator({ optional: true })];
}

export default patchMeValidator;
