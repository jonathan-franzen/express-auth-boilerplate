import path from 'node:path'

import { Prisma } from '@prisma/client'
import { Transporter } from 'nodemailer'
import Twig from 'twig'

import { FRONTEND_URL, MAILER_FROM } from '@/constants/environment.constants.js'

import UserGetPayload = Prisma.UserGetPayload
import { SendEmailOptionsMailerInterface } from '@/types/mailer.types.js'
import { User } from '@/types/user.types.js'

export class MailerService {
  constructor(
    private readonly mailer: Transporter,
    private readonly templatesPath: string
  ) {}

  private async renderTemplate(
    templateName: string,
    context: Record<string, string>
  ): Promise<string> {
    return new Promise(
      (
        resolve: (value: PromiseLike<string> | string) => void,
        reject: (reason?: Error) => void
      ): void => {
        const templatePath = path.join(this.templatesPath, templateName)
        Twig.renderFile(
          templatePath,
          context,
          (error: Error, html: PromiseLike<string> | string): void => {
            if (error) {
              reject(new Error(`Error rendering email template: ${error}`))
            } else {
              resolve(html)
            }
          }
        )
      }
    )
  }

  async sendEmail(options: SendEmailOptionsMailerInterface): Promise<void> {
    const { context, subject, templateName, to } = options
    const html = await this.renderTemplate(templateName, context)

    const mailOptions = {
      from: MAILER_FROM,
      html,
      subject,
      to,
    }

    await this.mailer.sendMail(mailOptions)
  }

  getResetPasswordEmailOptions(
    user: UserGetPayload<{ omit: { password: true; roles: true } }>,
    resetPasswordToken: string
  ): SendEmailOptionsMailerInterface {
    return {
      context: {
        name: user.firstName,
        resetPasswordUrl: `${FRONTEND_URL}/reset-password/${resetPasswordToken}`,
      },
      subject: 'Reset your password',
      templateName: 'reset-password.template.twig',
      to: user.email,
    }
  }

  getVerifyEmailOptions(
    user: User,
    verifyToken: string
  ): SendEmailOptionsMailerInterface {
    return {
      context: {
        name: user.firstName,
        verifyUrl: `${FRONTEND_URL}/verify-email/${verifyToken}`,
      },
      subject: 'Verify your email',
      templateName: 'verify-email.template.twig',
      to: user.email,
    }
  }
}
