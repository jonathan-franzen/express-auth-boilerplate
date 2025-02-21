import capitalizeSanitizer from '@/sanitizers/capitalize.sanitizer.js';
import { body } from 'express-validator';

function firstNameValidator({ optional }: { optional: boolean }) {
	return [
		body('firstName')
			.optional(optional)
			.exists()
			.withMessage({ message: 'First name is required.', status: 400 })
			.isString()
			.withMessage({ message: 'First name must be a string.', status: 400 })
			.trim()
			.customSanitizer(capitalizeSanitizer),
	];
}

export default firstNameValidator;
