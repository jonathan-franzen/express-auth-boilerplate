import { UserController } from '@/server/controllers/user/user.controller.js'
import {
  httpErrorService,
  prismaErrorService,
} from '@/server/services/error/index.js'
import { jwtService } from '@/server/services/jwt/index.js'
import { userService } from '@/server/services/user/index.js'
import { userTokenService } from '@/server/services/user-token/index.js'

const userController = new UserController(
  httpErrorService,
  prismaErrorService,
  userService,
  userTokenService,
  jwtService
)

export { userController }
