import refreshTokenFragmentValidator from '@/validators/fragments/refreshToken.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export default function deleteLogoutAuthValidator(): ValidationChain[] {
	return [...refreshTokenFragmentValidator()];
}
