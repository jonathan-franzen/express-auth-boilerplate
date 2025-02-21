import refreshTokenValidator from '@/validators/fragments/refreshToken.validator.js';

function deleteLogoutValidator() {
	return [...refreshTokenValidator()];
}

export default deleteLogoutValidator;
