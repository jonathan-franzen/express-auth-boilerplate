import refreshTokenValidator from '@/validators/fragments/refreshToken.validator.js';

function postRefreshValidator() {
	return [...refreshTokenValidator()];
}

export default postRefreshValidator;
