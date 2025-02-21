import passwordValidator from '@/validators/fragments/password.validator.js';

function postMeResetPasswordValidator() {
	return [...passwordValidator({ includeStrongCheck: false }), ...passwordValidator({ includeStrongCheck: true, key: 'newPassword' })];
}

export default postMeResetPasswordValidator;
