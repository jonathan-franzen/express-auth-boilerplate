import { cookie, ValidationChain } from 'express-validator';

export function refreshTokenFragmentValidator(): ValidationChain[] {
	return [cookie('refreshToken').exists().withMessage({ message: 'Refresh token is required.', status: 400 })];
}
