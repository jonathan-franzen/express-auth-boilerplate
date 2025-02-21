import { AWS_LAMBDA_FUNCTION_NAME, AWS_REGION, WORKQUEUE_URL } from '@/constants/environment.constants.js';
import { EventsInterface } from '@/interfaces/events/events.interfaces.js';
import { SendEmailOptionsMailerInterface } from '@/interfaces/mailer/mailer.interfaces.js';
import mailerService from '@/services/mailer/index.js';
import { EventManager } from 'serverless-sqs-events';

const eventManager = new EventManager<EventsInterface>(WORKQUEUE_URL, { region: AWS_REGION }, !AWS_LAMBDA_FUNCTION_NAME);

eventManager.on('sendEmail', (data: SendEmailOptionsMailerInterface) => mailerService.sendEmail(data));

export default eventManager;
