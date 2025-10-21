import { PrismaClient } from '@prisma/client'

import { enumExtension } from '@/config/prisma/extensions/enum.extension.prisma.config.js'
import { passwordExtension } from '@/config/prisma/extensions/password.extension.prisma.config.js'

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
