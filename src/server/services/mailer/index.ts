import path from 'node:path'

import nodemailer from 'nodemailer'

import { NODE_ENV } from '@/config/env.config.js'
import { MailerService } from '@/server/services/mailer/mailer.service.js'

const transport = nodemailer.createTransport(
  NODE_ENV === 'dev'
    ? {
        port: 1025,
      }
    : {}
)

const templatesPath: string = path.join(process.cwd(), 'src', 'email-templates')
export const mailerService = new MailerService(transport, templatesPath)
