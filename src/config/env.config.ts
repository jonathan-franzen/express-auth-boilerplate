import process from 'node:process'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  PORT: z.string().default('8000'),
  LOG_LEVEL: z
    .enum([
      'debug',
      'info',
      'notice',
      'warning',
      'error',
      'critical',
      'alert',
      'emergency',
    ])
    .default('debug'),

  REDIS_URL: z.url(),

  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),

  FRONTEND_URL: z.string().default('http://localhost:3000'),
  MAILER_FROM: z.string(),
})

export const {
  NODE_ENV,
  PORT,
  LOG_LEVEL,
  REDIS_URL,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  FRONTEND_URL,
  MAILER_FROM,
} = envSchema.parse(process.env)
