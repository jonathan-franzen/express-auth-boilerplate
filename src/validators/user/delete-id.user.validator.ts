import idFragmentValidator from '@/validators/fragments/id.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function deleteIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}

export default deleteIdUserValidator;
