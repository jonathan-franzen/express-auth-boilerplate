import refreshTokenFragmentValidator from '@/validators/fragments/refreshToken.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function deleteLogoutAuthValidator(): ValidationChain[] {
	return [...refreshTokenFragmentValidator()];
}

export default deleteLogoutAuthValidator;
