import * as dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ path: process.env.APP_ENV == 'prod' ? '.env' : '.env.local' });

const env = process.env;

// App
export const APP_ENV = (env.APP_ENV as string) || 'dev';
export const PORT = (env.PORT as string) || '8000';
export const LOG_LEVEL = (env.LOG_LEVEL as string) || 'debug';
export const AWS_REGION = env.AWS_REGION as string;

// Tokens
export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET as string;

// General
export const FRONTEND_URL = env.FRONTEND_URL as string;
export const MAILER_FROM = env.MAILER_FROM as string;
export const WORKQUEUE_URL = env.WORKQUEUE_URL as string;

// Provided
export const AWS_LAMBDA_FUNCTION_NAME = env.AWS_LAMBDA_FUNCTION_NAME as string;
