import { APP_ENV } from '@/constants/environment.constants.js';

const expressRateLimitConfig = {
	legacyHeaders: false,
	max: APP_ENV === 'dev' ? Number.MAX_SAFE_INTEGER : 200,
	message: { error: 'Too many requests, please try again later.' },
	standardHeaders: true,
	windowMs: 15 * 60 * 1000,
};

export default expressRateLimitConfig;
