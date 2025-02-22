import refreshTokenValidator from '@/validators/fragments/refresh-token.validator.js';
import { ValidationChain } from 'express-validator';

function deleteLogoutValidator(): ValidationChain[] {
	return [...refreshTokenValidator()];
}

export default deleteLogoutValidator;
