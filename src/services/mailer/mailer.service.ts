import { Transporter } from 'nodemailer';
import Twig from 'twig';
import * as path from 'path';
import { User } from '@prisma/client';
import { SendEmailOptionsEmailInterface } from '@/interfaces/email/send-email-options.email.interface.js';
import {
	FRONTEND_URL,
	MAILER_FROM,
} from '@/constants/environment.constants.js';

export class MailerService {
	constructor(
		private readonly mailer: Transporter,
		private readonly templatesPath: string,
	) {}

	private async renderTemplate(
		templateName: string,
		context: Record<string, any>,
	): Promise<string> {
		return new Promise(
			(
				resolve: (value: string | PromiseLike<string>) => void,
				reject: (reason?: any) => void,
			): void => {
				const templatePath: string = path.join(
					this.templatesPath,
					templateName,
				);

				Twig.renderFile(
					templatePath,
					context,
					(err: Error, html: string | PromiseLike<string>): void => {
						if (err) {
							reject(`Error rendering email template: ${err}`);
						} else {
							resolve(html);
						}
					},
				);
			},
		);
	}

	private async sendMail(
		options: SendEmailOptionsEmailInterface,
	): Promise<void> {
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

	async sendVerifyEmail(user: User, verifyToken: string): Promise<void> {
		await this.sendMail({
			to: user.email,
			subject: 'Verify your email',
			templateName: 'verify-email.template.twig',
			context: {
				name: user.firstName,
				verifyUrl: `${FRONTEND_URL}/verify/${verifyToken}`,
			},
		});
	}

	async sendResetPasswordEmail(
		user: User,
		resetPasswordToken: string,
	): Promise<void> {
		await this.sendMail({
			to: user.email,
			subject: 'Reset your password',
			templateName: 'reset-password.template.twig',
			context: {
				name: user.firstName,
				resetPasswordUrl: `${FRONTEND_URL}/reset-password/${resetPasswordToken}`,
			},
		});
	}
}
