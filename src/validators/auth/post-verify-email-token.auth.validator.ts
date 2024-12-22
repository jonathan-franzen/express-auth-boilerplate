import verifyEmailTokenFragmentValidator from '@/validators/fragments/verify-email-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function postVerifyEmailTokenAuthValidator(): ValidationChain[] {
	return [...verifyEmailTokenFragmentValidator()];
}

export default postVerifyEmailTokenAuthValidator;
