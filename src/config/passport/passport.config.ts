import { until } from '@open-draft/until'
import passport, { PassportStatic } from 'passport'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'

import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js'
import { UserService } from '@/server/services/user/user.service.js'
import { JwtDecodedAccessToken } from '@/types/jwt.types.js'

class PassportConfig {
  constructor(private readonly userService: UserService) {
    passport.use(
      new Strategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: ACCESS_TOKEN_SECRET,
        },
        this.verifyCallback.bind(this)
      )
    )
  }

  getPassportInstance(): PassportStatic {
    return passport
  }

  private async verifyCallback(
    jwtPayload: JwtDecodedAccessToken,
    done: VerifiedCallback
  ): Promise<void> {
    const id = jwtPayload.userInfo.id as string

    if (!id) {
      return done(undefined, false)
    }

    const [error, data] = await until(() => this.userService.getUser({ id }))

    if (error) {
      return done(error, false)
    }

    if (!data) {
      return done(undefined, false)
    }

    return done(undefined, data)
  }
}

export { PassportConfig }
