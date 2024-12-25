import process from 'process';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.APP_ENV == 'prod' ? '.env' : '.env.local' });

const env: NodeJS.ProcessEnv = process.env;

// App
export const APP_ENV: string = (env.APP_ENV as string) || 'dev';
export const PORT: string = (env.PORT as string) || '8000';
export const AWS_REGION: string = env.AWS_REGION as string;

// Tokens
export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET as string;

// General
export const MAILER_FROM = env.MAILER_FROM as string;
export const FRONTEND_URL = env.FRONTEND_URL as string;
export const WORKQUEUE_URL: string = env.WORKQUEUE_URL as string;

// Provided
export const AWS_LAMBDA_FUNCTION_NAME = env.AWS_LAMBDA_FUNCTION_NAME as string;
