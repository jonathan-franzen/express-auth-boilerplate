import emailFragmentValidator from '@/validators/fragments/email.fragment.validator.js';
import passwordFragmentValidator from '@/validators/fragments/password.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postLoginAuthValidator(): ValidationChain[] {
	return [...emailFragmentValidator({ optional: false }), ...passwordFragmentValidator({ includeStrongCheck: false })];
}

export default postLoginAuthValidator;
