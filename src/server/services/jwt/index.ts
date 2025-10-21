import { httpErrorService } from '@/server/services/error/index.js'
import { JwtService } from '@/server/services/jwt/jwt.service.js'

const jwtService = new JwtService(httpErrorService)

export { jwtService }
