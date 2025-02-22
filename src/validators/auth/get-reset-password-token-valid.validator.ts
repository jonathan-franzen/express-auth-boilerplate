import resetPasswordTokenValidator from '@/validators/fragments/reset-password-token.validator.js';
import { ValidationChain } from 'express-validator';

function getResetPasswordTokenValidValidator(): ValidationChain[] {
	return [...resetPasswordTokenValidator()];
}

export default getResetPasswordTokenValidValidator;
