import passwordFragmentValidator from '@/validators/fragments/password.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postMeResetPasswordUserValidator(): ValidationChain[] {
	return [...passwordFragmentValidator({ includeStrongCheck: false }), ...passwordFragmentValidator({ key: 'newPassword', includeStrongCheck: true })];
}

export default postMeResetPasswordUserValidator;
