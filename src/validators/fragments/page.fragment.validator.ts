import { body, ValidationChain } from 'express-validator';

function pageFragmentValidator(): ValidationChain[] {
	return [body('page').optional().isNumeric().withMessage({ message: 'Page must be numerical.', status: 400 })];
}

export default pageFragmentValidator;
