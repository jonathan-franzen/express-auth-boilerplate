import limitFragmentValidator from '@/validators/fragments/limit.fragment.validator.js';
import pageFragmentValidator from '@/validators/fragments/page.fragment.validator.js';
import { ValidationChain } from 'express-validator';

function getUserValidator(): ValidationChain[] {
	return [...pageFragmentValidator(), ...limitFragmentValidator()];
}

export default getUserValidator;
