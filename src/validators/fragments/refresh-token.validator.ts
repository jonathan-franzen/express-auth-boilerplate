import { cookie, ValidationChain } from 'express-validator';

function refreshTokenValidator(): ValidationChain[] {
	return [cookie('refreshToken').exists().withMessage({ message: 'Refresh token is required.', status: 400 })];
}

export default refreshTokenValidator;
