import { Prisma } from '@prisma/client'

import { UserRoles } from '@/types/user.types.js'

export const enumExtension = Prisma.defineExtension({
  result: {
    user: {
      roles: {
        needs: { roles: true },
        compute(user) {
          return user.roles as UserRoles[]
        },
      },
    },
  },
})
