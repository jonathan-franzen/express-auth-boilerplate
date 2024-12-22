import idFragmentValidator from '@/validators/fragments/id.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function getIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}

export default getIdUserValidator;
