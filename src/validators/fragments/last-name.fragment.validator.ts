import { body, ValidationChain } from 'express-validator';
import { capitalizeSanitizer } from '@/validators/sanitizers/capitalize.sanitizer.js';

export function lastNameFragmentValidator(): ValidationChain[] {
	return [
		body('lastName')
			.exists()
			.withMessage({ message: 'Last name is required.', status: 400 })
			.isString()
			.withMessage({ message: 'Last name must be a string.', status: 400 })
			.trim()
			.customSanitizer(capitalizeSanitizer),
	];
}