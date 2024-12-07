import { refreshTokenFragmentValidator } from '@/validators/fragments/refreshToken.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function refreshAuthValidator(): ValidationChain[] {
	return [...refreshTokenFragmentValidator()];
}
