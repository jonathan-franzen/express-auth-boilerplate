import { idFragmentValidator } from '@/validators/fragments/id.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export function deleteIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}
