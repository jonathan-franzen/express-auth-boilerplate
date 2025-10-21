import { Prisma } from '@prisma/client'

import { prisma } from '@/config/prisma/prisma.config.js'
import { RESET_PASSWORD_TOKEN_LIFETIME } from '@/constants/auth.constants.js'

class ResetPasswordTokenService {
  upsertResetPasswordToken(token: string, userId: string) {
    return prisma.resetPasswordToken.upsert({
      create: {
        token,
        userId,
      },
      update: {
        token,
      },
      where: {
        userId,
      },
    })
  }

  getResetPasswordToken(where: Prisma.ResetPasswordTokenWhereUniqueInput) {
    return prisma.resetPasswordToken.findUnique({
      where,
    })
  }

  deleteResetPasswordToken(where: Prisma.ResetPasswordTokenWhereUniqueInput) {
    return prisma.resetPasswordToken.delete({
      where,
    })
  }

  deleteExpiredResetPasswordTokens() {
    return prisma.resetPasswordToken.deleteMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - RESET_PASSWORD_TOKEN_LIFETIME),
        },
      },
    })
  }
}

export { ResetPasswordTokenService }
