import { cookie } from 'express-validator';

function refreshTokenValidator() {
	return [cookie('refreshToken').exists().withMessage({ message: 'Refresh token is required.', status: 400 })];
}

export default refreshTokenValidator;
