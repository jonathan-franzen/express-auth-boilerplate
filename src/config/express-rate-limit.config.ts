const expressRateLimitConfig = {
	windowMs: 15 * 60 * 1000,
	max: 200,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many requests, please try again later.' },
};

export default expressRateLimitConfig;
