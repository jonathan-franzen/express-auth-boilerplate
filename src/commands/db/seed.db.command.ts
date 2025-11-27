import { until } from '@open-draft/until'
import { Prisma } from '@prisma/client'
import { Command } from 'commander'

import { logger } from '@/utils/logger.js'

import UserCreateInput = Prisma.UserCreateInput
import { userService } from '@/server/services/user/index.js'
import { User, UserRoles } from '@/types/user.types.js'

const seedDbCommand = new Command('db:seed')
  .description('Init database')
  .action(seed)

async function createUser(userCreateInput: UserCreateInput): Promise<void> {
  const user = {
    ...userCreateInput,
    emailVerifiedAt: new Date(Date.now()),
  }

  await userService.upsertUser({ ...user }, { email: user.email }, { ...user })
}

function getUsers(): (Omit<
  User,
  'createdAt' | 'emailVerifiedAt' | 'id' | 'updatedAt'
> & { password: string })[] {
  return [
    {
      email: 'admin@email.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'admin',
      roles: [UserRoles.USER, UserRoles.ADMIN],
    },
    {
      email: 'user@email.com',
      firstName: 'Don',
      lastName: 'Joe',
      password: 'user',
      roles: [UserRoles.USER],
    },
  ]
}

async function seed(): Promise<void> {
  const users = getUsers()

  const [error] = await until(() =>
    Promise.all(users.map((user) => createUser(user)))
  )

  if (error) {
    logger.error('Error during database seeding:', error)
    throw new Error('Error during database seeding.')
  }

  logger.info('Seeding completed successfully.')
}

export default seedDbCommand
