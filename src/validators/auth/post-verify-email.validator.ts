import verifyEmailTokenValidator from '@/validators/fragments/verify-email-token.validator.js';
import { ValidationChain } from 'express-validator';

function postVerifyEmailValidator(): ValidationChain[] {
	return [...verifyEmailTokenValidator()];
}

export default postVerifyEmailValidator;
