import { MailerService } from '@/services/mailer/mailer.service.js';
import nodemailer from 'nodemailer';
import { APP_ENV } from '@/constants/environment.constants.js';
import * as path from 'path';

const transport = nodemailer.createTransport(
	APP_ENV === 'dev'
		? {
				port: 1025,
			}
		: {},
);
const templatesPath: string = path.join(
	__dirname,
	'..',
	'..',
	'email-templates',
);

export const mailerService = new MailerService(transport, templatesPath);
