import refreshTokenFragmentValidator from '@/validators/fragments/refreshToken.fragment.validator.js';

function deleteLogoutAuthValidator() {
	return [...refreshTokenFragmentValidator()];
}

export default deleteLogoutAuthValidator;
