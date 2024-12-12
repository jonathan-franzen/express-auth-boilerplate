import * as path from 'path';
import { APP_ENV } from '@/constants/environment.constants.js';
import MailerService from '@/services/mailer/mailer.service.js';
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport(
	APP_ENV === 'dev'
		? {
				port: 1025,
			}
		: {},
);

const templatesPath: string = path.join(process.cwd(), 'src', 'email-templates');
const mailerService = new MailerService(transport, templatesPath);

export default mailerService;
