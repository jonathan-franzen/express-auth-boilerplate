import { randomUUID } from 'node:crypto'

import { until } from '@open-draft/until'
import jwt, { JwtPayload } from 'jsonwebtoken'

import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
  RESET_PASSWORD_TOKEN_LIFETIME,
  VERIFY_EMAIL_TOKEN_LIFETIME,
} from '@/constants/auth.constants.js'
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '@/constants/environment.constants.js'
import { HttpErrorService } from '@/server/services/error/http.error.service.js'
import { logger } from '@/utils/logger.js'

export class JwtService {
  constructor(private readonly httpErrorService: HttpErrorService) {}

  private jwtVerify<T>(
    token: string,
    secret: string
  ): Promise<(JwtPayload & T) | string | null> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) =>
        err ? reject(err) : resolve(decoded as (JwtPayload & T) | string | null)
      )
    })
  }

  signAccessToken(id: string, email: string): string {
    return jwt.sign(
      {
        userInfo: {
          id,
          email,
        },
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_LIFETIME }
    )
  }

  signRefreshToken(email: string): string {
    return jwt.sign({ email, jti: randomUUID() }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    })
  }

  signVerifyEmailToken(email: string): string {
    return jwt.sign(
      {
        verifyEmail: {
          email: email,
        },
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: VERIFY_EMAIL_TOKEN_LIFETIME }
    )
  }

  signResetPasswordToken(email: string): string {
    return jwt.sign(
      {
        resetPassword: {
          email: email,
        },
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: RESET_PASSWORD_TOKEN_LIFETIME }
    )
  }

  decodeToken<T>(token: string): T | null {
    return jwt.decode(token) as T | null
  }

  async verifyToken<T>(
    token: string,
    secret: string,
    key: keyof T
  ): Promise<JwtPayload & T> {
    const [verifyError, verified] = await until(() =>
      this.jwtVerify<T>(token, secret)
    )

    if (!!verified && typeof verified === 'object' && verified[key]) {
      return verified
    }

    if (verifyError instanceof jwt.TokenExpiredError) {
      logger.warning({
        context: { error: verifyError, key },
        message: 'Token expired.',
      })

      throw this.httpErrorService.tokenExpiredError()
    }

    logger.warning({
      context: { error: verifyError, key },
      message: 'Token invalid.',
    })

    throw this.httpErrorService.tokenInvalidError()
  }
}
