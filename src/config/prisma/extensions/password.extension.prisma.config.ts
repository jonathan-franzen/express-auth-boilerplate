import { Prisma } from '@prisma/client'
import { PayloadToResult } from '@prisma/client/runtime/binary.js'
import bcrypt from 'bcryptjs'

export const passwordExtension = Prisma.defineExtension({
  query: {
    user: {
      async create({
        args,
        query,
      }): Promise<PayloadToResult<Prisma.$UserPayload>> {
        if (args.data.password) {
          args.data.password = await bcrypt.hash(args.data.password, 10)
        }
        return query(args)
      },
      async update({
        args,
        query,
      }): Promise<PayloadToResult<Prisma.$UserPayload>> {
        if (args.data.password) {
          args.data.password = await bcrypt.hash(
            args.data.password as string,
            10
          )
        }
        return query(args)
      },
      async upsert({
        args,
        query,
      }): Promise<PayloadToResult<Prisma.$UserPayload>> {
        if (args.update.password) {
          args.update.password = await bcrypt.hash(
            args.update.password as string,
            10
          )
        }
        return query(args)
      },
    },
  },
  result: {
    user: {
      validatePassword: {
        compute:
          (user: {
            password: string
          }): ((rawPassword: string) => Promise<boolean>) =>
          async (rawPassword: string): Promise<boolean> => {
            const hash = user.password

            if (!hash) {
              return false
            }

            return await bcrypt.compare(rawPassword, hash)
          },
        needs: { password: true },
      },
    },
  },
})
