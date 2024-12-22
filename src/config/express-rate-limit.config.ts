import { APP_ENV } from '@/constants/environment.constants.js';

const expressRateLimitConfig = {
	windowMs: 15 * 60 * 1000,
	max: APP_ENV === 'dev' ? Number.MAX_SAFE_INTEGER : 200,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many requests, please try again later.' },
};

export default expressRateLimitConfig;
