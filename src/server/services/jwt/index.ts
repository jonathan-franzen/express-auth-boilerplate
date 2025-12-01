import { httpErrorService } from '@/server/services/error/index.js'
import { JwtService } from '@/server/services/jwt/jwt.service.js'

export const jwtService = new JwtService(httpErrorService)
