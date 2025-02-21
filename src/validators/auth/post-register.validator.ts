import emailValidator from '@/validators/fragments/email.validator.js';
import firstNameValidator from '@/validators/fragments/first-name.validator.js';
import lastNameValidator from '@/validators/fragments/last-name.validator.js';
import passwordValidator from '@/validators/fragments/password.validator.js';

function postRegisterValidator() {
	return [
		...emailValidator({ optional: false }),
		...passwordValidator({ includeStrongCheck: true }),
		...firstNameValidator({ optional: false }),
		...lastNameValidator({ optional: false }),
	];
}

export default postRegisterValidator;
