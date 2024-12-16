import { serverlessConsole } from 'serverless-console';

export const handler: (command: string) => Promise<void> = serverlessConsole;
