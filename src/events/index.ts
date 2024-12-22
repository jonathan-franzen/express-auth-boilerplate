import { AWS_REGION, WORKQUEUE_URL } from '@/constants/environment.constants.js';
import Events from '@/interfaces/events/events.interface.js';
import SendVerifyEmailMailerInterface from '@/interfaces/mailer/send-verify-email.mailer.interface.js';
import mailerService from '@/services/mailer/index.js';
import { EventManager } from 'serverless-sqs-events';

const eventManager = new EventManager<Events>(WORKQUEUE_URL, { region: AWS_REGION }, !process.env.AWS_LAMBDA_FUNCTION_NAME);

eventManager.on('sendVerifyEmail', (data: SendVerifyEmailMailerInterface) => mailerService.sendVerifyEmail(data));

export default eventManager;
