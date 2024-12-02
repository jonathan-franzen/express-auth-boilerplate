import { jwtFragmentValidator } from '@/validators/fragments/jwt.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function refreshAuthValidator(): ValidationChain[] {
	return [...jwtFragmentValidator()];
}
