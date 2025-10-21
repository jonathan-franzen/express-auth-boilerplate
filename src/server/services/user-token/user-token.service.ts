import { Prisma } from '@prisma/client'

import { prisma } from '@/config/prisma/prisma.config.js'
import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js'

class UserTokenService {
  createUserToken(data: Prisma.UserTokenUncheckedCreateInput) {
    return prisma.userToken.create({
      data,
    })
  }

  getUserToken(where: Prisma.UserTokenWhereUniqueInput) {
    return prisma.userToken.findUnique({
      where,
    })
  }

  deleteUserToken(where: Prisma.UserTokenWhereUniqueInput) {
    return prisma.userToken.delete({
      where,
    })
  }

  deleteUserTokens(where: Prisma.UserTokenWhereInput) {
    return prisma.userToken.deleteMany({
      where,
    })
  }

  deleteExpiredUserTokens() {
    return prisma.userToken.deleteMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - REFRESH_TOKEN_LIFETIME),
        },
      },
    })
  }
}

export { UserTokenService }
