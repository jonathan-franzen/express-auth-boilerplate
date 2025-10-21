import { PassportConfig } from '@/config/passport/passport.config.js'
import { userService } from '@/server/services/user/index.js'

const passport = new PassportConfig(userService)

export { passport }
