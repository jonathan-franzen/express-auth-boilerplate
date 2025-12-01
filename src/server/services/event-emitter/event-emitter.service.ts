import EventEmitter from 'node:events'

import { MailerService } from '@/server/services/mailer/mailer.service.js'
import { SendEmailOptionsMailerInterface } from '@/types/mailer.types.js'

export class EventEmitterService extends EventEmitter {
  constructor(private readonly mailerService: MailerService) {
    super()
    this.registerEvents()
  }

  private registerEvents() {
    this.on('email:send', this.handleSendEmail)
  }

  private handleSendEmail = (data: SendEmailOptionsMailerInterface) => {
    void this.mailerService.sendEmail(data)
  }

  public sendEmail(data: SendEmailOptionsMailerInterface) {
    this.emit('email:send', data)
  }
}
