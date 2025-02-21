import passwordFragmentValidator from '@/validators/fragments/password.fragment.validator.js';

function postMeResetPasswordUserValidator() {
	return [...passwordFragmentValidator({ includeStrongCheck: false }), ...passwordFragmentValidator({ includeStrongCheck: true, key: 'newPassword' })];
}

export default postMeResetPasswordUserValidator;
