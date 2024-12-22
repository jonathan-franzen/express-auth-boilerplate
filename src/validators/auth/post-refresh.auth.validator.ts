import refreshTokenFragmentValidator from '@/validators/fragments/refreshToken.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postRefreshAuthValidator(): ValidationChain[] {
	return [...refreshTokenFragmentValidator()];
}

export default postRefreshAuthValidator;
