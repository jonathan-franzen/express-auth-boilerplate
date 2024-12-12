import idFragmentValidator from '@/validators/fragments/id.fragment.validator.js';
import { ValidationChain } from 'express-validator';

export default function getIdUserValidator(): ValidationChain[] {
	return [...idFragmentValidator()];
}
