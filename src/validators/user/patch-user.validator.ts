import emailValidator from '@/validators/fragments/email.validator.js';
import firstNameValidator from '@/validators/fragments/first-name.validator.js';
import idValidator from '@/validators/fragments/id.validator.js';
import lastNameValidator from '@/validators/fragments/last-name.validator.js';
import { ValidationChain } from 'express-validator';

function patchUserValidator(): ValidationChain[] {
	return [...idValidator(), ...emailValidator({ optional: true }), ...firstNameValidator({ optional: true }), ...lastNameValidator({ optional: true })];
}

export default patchUserValidator;
