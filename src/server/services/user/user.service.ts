import { Prisma } from '@prisma/client'

import { prisma } from '@/config/prisma/prisma.config.js'

class UserService {
  constructor() {}

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      omit: { validatePassword: true },
    })
  }

  upsertUser(
    createInput: Prisma.UserCreateInput,
    where: Prisma.UserWhereUniqueInput,
    updateInput: Prisma.UserUpdateInput
  ) {
    return prisma.user.upsert({
      create: createInput,
      where,
      update: updateInput,
      omit: { validatePassword: true },
    })
  }

  getUser(where: Prisma.UserWhereUniqueInput) {
    return prisma.user.findUnique({
      where,
      omit: { validatePassword: true },
    })
  }

  getUserCount(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where })
  }

  getUsers(args: Prisma.UserFindManyArgs) {
    return prisma.user.findMany(args)
  }

  getUserWithValidatePassword(where: Prisma.UserWhereUniqueInput) {
    return prisma.user.findUnique({
      where,
    })
  }

  updateUser(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where,
      data,
      omit: { validatePassword: true },
    })
  }

  deleteUser(where: Prisma.UserWhereUniqueInput) {
    return prisma.user.delete({
      where,
      omit: { validatePassword: true },
    })
  }
}

export { UserService }
