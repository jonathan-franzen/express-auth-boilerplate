import { prisma } from '@/config/prisma/prisma.config.js';
import { getUsersPrismaInterface, UserPrismaInterface } from '@/interfaces/prisma/user/user.prisma.interfaces.js';
import PrismaService from '@/services/prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

import UserCreateInput = Prisma.UserCreateInput;
import UserUpdateInput = Prisma.UserUpdateInput;
import UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

class UserPrismaService extends PrismaService {
	async createOrUpdateUser(email: string, userCreateUpdateInput: UserCreateInput): Promise<UserPrismaInterface> {
		return prisma.user.upsert({
			create: userCreateUpdateInput,
			update: userCreateUpdateInput,
			where: { email },
		});
	}

	async createUser(userCreateInput: UserCreateInput): Promise<UserPrismaInterface> {
		return prisma.user.create({
			data: userCreateInput,
		});
	}

	async deleteUser(id: string): Promise<UserPrismaInterface> {
		return prisma.user.delete({
			where: {
				id,
			},
		});
	}

	async getUserByEmail(email: string): Promise<null | UserPrismaInterface> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	async getUserById(id: string): Promise<null | UserPrismaInterface> {
		return prisma.user.findUnique({
			where: {
				id,
			},
		});
	}

	async getUsers(query: getUsersPrismaInterface): Promise<null | UserPrismaInterface[]> {
		const { filters = {}, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'asc' } = query;

		const skip = (page - 1) * limit;

		return prisma.user.findMany({
			orderBy: {
				[sortBy]: sortOrder,
			},
			skip,
			take: limit,
			where: filters,
		});
	}

	async getUsersCount(filters?: Record<string, string>): Promise<number> {
		return prisma.user.count({
			where: filters || {},
		});
	}

	async updateUser(where: UserWhereUniqueInput, data: UserUpdateInput): Promise<UserPrismaInterface> {
		return prisma.user.update({
			data: data,
			where: where,
		});
	}
}

export default UserPrismaService;
