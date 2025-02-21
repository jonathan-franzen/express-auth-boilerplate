import emailValidator from '@/validators/fragments/email.validator.js';
import passwordValidator from '@/validators/fragments/password.validator.js';

function postLoginValidator() {
	return [...emailValidator({ optional: false }), ...passwordValidator({ includeStrongCheck: false })];
}

export default postLoginValidator;
