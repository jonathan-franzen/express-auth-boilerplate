import { FRONTEND_URL, MAILER_FROM } from '@/constants/environment.constants.js';
import { SendEmailOptionsMailerInterface } from '@/interfaces/mailer/mailer.interfaces.js';
import { UserPrismaInterface } from '@/interfaces/prisma/user/user.prisma.interfaces.js';
import { Prisma } from '@prisma/client';
import { Transporter } from 'nodemailer';
import * as path from 'path';
import Twig from 'twig';

import UserGetPayload = Prisma.UserGetPayload;

class MailerService {
	constructor(
		private readonly mailer: Transporter,
		private readonly templatesPath: string,
	) {}

	async getResetPasswordEmailOptions(
		user: UserGetPayload<{ omit: { password: true; roles: true } }>,
		resetPasswordToken: string,
	): Promise<SendEmailOptionsMailerInterface> {
		return {
			context: {
				name: user.firstName,
				resetPasswordUrl: `${FRONTEND_URL}/reset-password/${resetPasswordToken}`,
			},
			subject: 'Reset your password',
			templateName: 'reset-password.template.twig',
			to: user.email,
		};
	}

	async getVerifyEmailOptions(user: UserPrismaInterface, verifyToken: string): Promise<SendEmailOptionsMailerInterface> {
		return {
			context: {
				name: user.firstName,
				verifyUrl: `${FRONTEND_URL}/verify-email/${verifyToken}`,
			},
			subject: 'Verify your email',
			templateName: 'verify-email.template.twig',
			to: user.email,
		};
	}

	async sendEmail(options: SendEmailOptionsMailerInterface): Promise<void> {
		const { context, subject, templateName, to } = options;
		const html = await this.renderTemplate(templateName, context);

		const mailOptions = {
			from: MAILER_FROM,
			html,
			subject,
			to,
		};

		await this.mailer.sendMail(mailOptions);
	}

	private async renderTemplate(templateName: string, context: Record<string, string>): Promise<string> {
		return new Promise((resolve: (value: PromiseLike<string> | string) => void, reject: (reason?: string) => void): void => {
			const templatePath: string = path.join(this.templatesPath, templateName);
			Twig.renderFile(templatePath, context, (err: Error, html: PromiseLike<string> | string): void => {
				if (err) {
					reject(`Error rendering email template: ${err}`);
				} else {
					resolve(html);
				}
			});
		});
	}
}

export default MailerService;
