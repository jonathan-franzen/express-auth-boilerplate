import { cookie } from 'express-validator';

function refreshTokenFragmentValidator() {
	return [cookie('refreshToken').exists().withMessage({ message: 'Refresh token is required.', status: 400 })];
}

export default refreshTokenFragmentValidator;
