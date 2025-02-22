import idValidator from '@/validators/fragments/id.validator.js';
import { ValidationChain } from 'express-validator';

function deleteUserValidator(): ValidationChain[] {
	return [...idValidator()];
}

export default deleteUserValidator;
