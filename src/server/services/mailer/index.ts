import path from 'node:path'

import nodemailer from 'nodemailer'

import { APP_ENV } from '@/constants/environment.constants.js'
import { MailerService } from '@/server/services/mailer/mailer.service.js'

const transport = nodemailer.createTransport(
  APP_ENV === 'dev'
    ? {
        port: 1025,
      }
    : {}
)

const templatesPath: string = path.join(process.cwd(), 'src', 'email-templates')
export const mailerService = new MailerService(transport, templatesPath)
