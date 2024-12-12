import resetPasswordTokenFragmentValidator from '@/validators/fragments/reset-password-token.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export default function getResetPasswordTokenAuthValidator(): ValidationChain[] {
	return [...resetPasswordTokenFragmentValidator()];
}
