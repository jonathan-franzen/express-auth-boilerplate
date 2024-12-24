import { AWS_REGION, WORKQUEUE_URL } from '@/constants/environment.constants.js';
import Events from '@/interfaces/events/events.interface.js';
import SendEmailOptionsMailerInterface from '@/interfaces/mailer/send-email-options.mailer.interface.js';
import mailerService from '@/services/mailer/index.js';
import { EventManager } from 'serverless-sqs-events';

const eventManager = new EventManager<Events>(WORKQUEUE_URL, { region: AWS_REGION }, !process.env.AWS_LAMBDA_FUNCTION_NAME);

eventManager.on('sendEmail', (data: SendEmailOptionsMailerInterface) => mailerService.sendEmail(data));

export default eventManager;
