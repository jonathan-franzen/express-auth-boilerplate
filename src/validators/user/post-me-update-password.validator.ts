import passwordValidator from '@/validators/fragments/password.validator.js';
import { ValidationChain } from 'express-validator';

function postMeUpdatePasswordValidator(): ValidationChain[] {
	return [...passwordValidator({ includeStrongCheck: false }), ...passwordValidator({ includeStrongCheck: true, key: 'newPassword' })];
}

export default postMeUpdatePasswordValidator;
