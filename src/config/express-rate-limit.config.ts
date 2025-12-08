import { NODE_ENV } from '@/config/env.config.js'

export const expressRateLimitConfig = {
  legacyHeaders: false,
  max: NODE_ENV === 'dev' ? Number.MAX_SAFE_INTEGER : 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
}
