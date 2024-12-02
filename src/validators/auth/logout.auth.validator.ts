import { ValidationChain } from 'express-validator';
import { jwtFragmentValidator } from '@/validators/fragments/jwt.fragment.validator.js';

export function logoutAuthValidator(): ValidationChain[] {
	return [...jwtFragmentValidator()];
}
