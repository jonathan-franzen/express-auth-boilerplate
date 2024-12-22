import eventManager from '@/events/index.js';
import { SQSEvent } from 'serverless-sqs-events';

export const handler = (event: SQSEvent) => eventManager.consume(event);
