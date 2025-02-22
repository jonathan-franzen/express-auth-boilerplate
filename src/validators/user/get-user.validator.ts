import idValidator from '@/validators/fragments/id.validator.js';
import { ValidationChain } from 'express-validator';

function getUserValidator(): ValidationChain[] {
	return [...idValidator()];
}

export default getUserValidator;
