import { idFragmentValidator } from '@/validators/fragments/id.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function deleteByIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}
