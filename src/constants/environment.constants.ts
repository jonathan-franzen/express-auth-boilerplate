import * as dotenv from 'dotenv';
import process from 'process';

dotenv.config({ path: process.env.APP_ENV == 'prod' ? '.env' : '.env.local' });

const env: NodeJS.ProcessEnv = process.env;

export const APP_ENV = env.APP_ENV as string;
export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET as string;
