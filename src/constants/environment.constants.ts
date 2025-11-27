import process from 'node:process'

import * as dotenv from 'dotenv'

dotenv.config({ path: process.env.APP_ENV == 'prod' ? '.env' : '.env.local' })

const env = process.env

// App
export const APP_ENV = (env.APP_ENV as string) || 'dev'
export const PORT = (env.PORT as string) || '8000'
export const LOG_LEVEL = (env.LOG_LEVEL as string) || 'debug'

// Tokens
export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET as string
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET as string

// General
export const FRONTEND_URL = env.FRONTEND_URL as string
export const REDIS_URL = env.REDIS_URL as string
export const MAILER_FROM = env.MAILER_FROM as string
