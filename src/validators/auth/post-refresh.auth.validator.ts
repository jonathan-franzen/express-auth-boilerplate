import refreshTokenFragmentValidator from '@/validators/fragments/refreshToken.fragment.validator.js';

function postRefreshAuthValidator() {
	return [...refreshTokenFragmentValidator()];
}

export default postRefreshAuthValidator;
