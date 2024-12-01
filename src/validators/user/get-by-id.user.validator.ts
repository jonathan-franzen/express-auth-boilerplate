import { ValidationChain } from 'express-validator';
import { idFragmentValidator } from '@/validators/fragments/id.fragment.validator.js';

export function getByIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}
