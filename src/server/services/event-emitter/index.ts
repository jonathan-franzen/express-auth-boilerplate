import { EventEmitterService } from '@/server/services/event-emitter/event-emitter.service.js'
import { mailerService } from '@/server/services/mailer/index.js'

export const eventEmitterService = new EventEmitterService(mailerService)
