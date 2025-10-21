import { AuthController } from '@/server/controllers/v1/auth/auth.controller.js'
import {
  httpErrorService,
  prismaErrorService,
} from '@/server/services/error/index.js'
import { eventEmitterService } from '@/server/services/event-emitter/index.js'
import { jwtService } from '@/server/services/jwt/index.js'
import { mailerService } from '@/server/services/mailer/index.js'
import { resetPasswordTokenService } from '@/server/services/reset-password-token/index.js'
import { userService } from '@/server/services/user/index.js'
import { userTokenService } from '@/server/services/user-token/index.js'

const authController = new AuthController(
  httpErrorService,
  prismaErrorService,
  eventEmitterService,
  jwtService,
  mailerService,
  userService,
  userTokenService,
  resetPasswordTokenService
)

export { authController }
