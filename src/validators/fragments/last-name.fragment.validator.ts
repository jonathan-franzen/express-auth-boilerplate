import capitalizeSanitizer from '@/validators/sanitizers/capitalize.sanitizer.js';
import { body, ValidationChain } from 'express-validator';

function lastNameFragmentValidator({ optional }: { optional: boolean }): ValidationChain[] {
	return [
		body('lastName')
			.optional(optional)
			.exists()
			.withMessage({ message: 'Last name is required.', status: 400 })
			.isString()
			.withMessage({ message: 'Last name must be a string.', status: 400 })
			.trim()
			.customSanitizer(capitalizeSanitizer),
	];
}

export default lastNameFragmentValidator;
