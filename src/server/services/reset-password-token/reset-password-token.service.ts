import { Prisma } from '@prisma/client'

import { RESET_PASSWORD_TOKEN_LIFETIME } from '@/config/app.config.js'
import { prisma } from '@/server/prisma/prisma.js'

export class ResetPasswordTokenService {
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
        createdAt: {
          lt: new Date(Date.now() - RESET_PASSWORD_TOKEN_LIFETIME),
        },
      },
    })
  }
}
