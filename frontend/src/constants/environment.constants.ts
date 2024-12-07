const env: NodeJS.ProcessEnv = process.env;

// App
export const APP_ENV: string = (env.APP_ENV as string) || 'dev';
export const PORT: string = (env.PORT as string) || '3000';

// Public
export const PUBLIC_FRONTEND_URL = env.NEXT_PUBLIC_FRONTEND_URL as string;
export const PUBLIC_BACKEND_URL = env.NEXT_PUBLIC_BACKEND_URL as string;

// Private
export const BACKEND_URL = env.BACKEND_URL as string;
