import { ValidationChain } from 'express-validator';
import { jwtFragmentValidator } from '@/validators/fragments/jwt.fragment.validator.js';

export function refreshAuthValidator(): ValidationChain[] {
	return [...jwtFragmentValidator()];
}
