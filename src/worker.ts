import 'tsconfig-paths/register';
import eventManager from '@/events/index.js';
import { SQSEvent } from 'serverless-sqs-events';

export const handler = (event: SQSEvent): Promise<void> => eventManager.consume(event);
