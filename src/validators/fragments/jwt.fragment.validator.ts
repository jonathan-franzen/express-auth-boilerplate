import { cookie, ValidationChain } from 'express-validator';

export function jwtFragmentValidator(): ValidationChain[] {
	return [cookie('jwt').exists().withMessage({ message: 'Refresh token is required.', status: 400 })];
}
