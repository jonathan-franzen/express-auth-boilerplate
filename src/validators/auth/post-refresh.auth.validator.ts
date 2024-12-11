import { refreshTokenFragmentValidator } from '@/validators/fragments/refreshToken.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function postRefreshAuthValidator(): ValidationChain[] {
	return [...refreshTokenFragmentValidator()];
}
