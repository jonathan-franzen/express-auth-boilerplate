import verifyEmailTokenFragmentValidator from '@/validators/fragments/verify-email-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export default function postVerifyEmailTokenAuthValidator(): ValidationChain[] {
	return [...verifyEmailTokenFragmentValidator()];
}
