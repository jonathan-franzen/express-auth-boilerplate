import { ValidationChain } from 'express-validator';
import { idFragmentValidator } from '@/validators/fragments/id.fragment.validator.js';

export function deleteByIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}
