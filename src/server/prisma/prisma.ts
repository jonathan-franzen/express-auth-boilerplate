import { PrismaClient } from '@prisma/client'

import { enumExtension } from '@/server/prisma/extensions/enum.extension.prisma.config.js'
import { passwordExtension } from '@/server/prisma/extensions/password.extension.prisma.config.js'

const createClient = () => {
  return new PrismaClient({
    omit: {
      user: {
        password: true,
      },
    },
  })
    .$extends(passwordExtension)
    .$extends(enumExtension)
}

export const prisma = createClient()
