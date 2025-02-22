import refreshTokenValidator from '@/validators/fragments/refresh-token.validator.js';
import { ValidationChain } from 'express-validator';

function postRefreshValidator(): ValidationChain[] {
	return [...refreshTokenValidator()];
}

export default postRefreshValidator;
