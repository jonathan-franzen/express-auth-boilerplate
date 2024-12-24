import * as path from 'path';
import { FRONTEND_URL, MAILER_FROM } from '@/constants/environment.constants.js';
import SendEmailOptionsMailerInterface from '@/interfaces/mailer/send-email-options.mailer.interface.js';
import { Prisma } from '@prisma/client';
import { Transporter } from 'nodemailer';
import Twig from 'twig';

import UserGetPayload = Prisma.UserGetPayload;

class MailerService {
	constructor(
		private readonly mailer: Transporter,
		private readonly templatesPath: string,
	) {}

	private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
		return new Promise((resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: any) => void): void => {
			const templatePath: string = path.join(this.templatesPath, templateName);
			Twig.renderFile(templatePath, context, (err: Error, html: string | PromiseLike<string>): void => {
				if (err) {
					reject(`Error rendering email template: ${err}`);
				} else {
					resolve(html);
				}
			});
		});
	}

	async sendEmail(options: SendEmailOptionsMailerInterface): Promise<void> {
		const { to, subject, templateName, context } = options;
		const html: string = await this.renderTemplate(templateName, context);

		const mailOptions = {
			from: MAILER_FROM,
			to,
			subject,
			html,
		};

		await this.mailer.sendMail(mailOptions);
	}

	async getVerifyEmailOptions(user: UserGetPayload<{ omit: { password: true; roles: true } }>, verifyToken: string): Promise<SendEmailOptionsMailerInterface> {
		return {
			to: user.email,
			subject: 'Verify your email',
			templateName: 'verify-email.template.twig',
			context: {
				name: user.firstName,
				verifyUrl: `${FRONTEND_URL}/verify-email/${verifyToken}`,
			},
		};
	}

	async getResetPasswordEmailOptions(
		user: UserGetPayload<{ omit: { password: true; roles: true } }>,
		resetPasswordToken: string,
	): Promise<SendEmailOptionsMailerInterface> {
		return {
			to: user.email,
			subject: 'Reset your password',
			templateName: 'reset-password.template.twig',
			context: {
				name: user.firstName,
				resetPasswordUrl: `${FRONTEND_URL}/reset-password/${resetPasswordToken}`,
			},
		};
	}
}

export default MailerService;
