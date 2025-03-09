import { prisma } from '@/config/prisma/prisma.config.js';
import { getUsersPrismaInterface, UserPrismaInterface, UserPrismaWithFunctionsInterface } from '@/interfaces/prisma/user/user.prisma.interfaces.js';
import PrismaService from '@/services/prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

import UserCreateInput = Prisma.UserCreateInput;
import UserUpdateInput = Prisma.UserUpdateInput;

class UserPrismaService extends PrismaService {
	async createOrUpdateUser(email: string, userCreateUpdateInput: UserCreateInput): Promise<UserPrismaInterface> {
		return prisma.user.upsert({
			create: userCreateUpdateInput,
			omit: { validatePassword: true },
			update: userCreateUpdateInput,
			where: { email },
		});
	}

	async createUser(userCreateInput: UserCreateInput): Promise<UserPrismaInterface> {
		return prisma.user.create({
			data: userCreateInput,
			omit: { validatePassword: true },
		});
	}

	async deleteUser(id: string): Promise<UserPrismaInterface> {
		return prisma.user.delete({
			omit: { validatePassword: true },
			where: {
				id,
			},
		});
	}

	async getUserByEmail<T extends boolean>(
		email: string,
		includeFunctions: T = false as T,
	): Promise<null | (T extends true ? UserPrismaWithFunctionsInterface : UserPrismaInterface)> {
		const user = await prisma.user.findUnique({
			where: { email },
			...(includeFunctions ? {} : { omit: { validatePassword: true } }),
		});

		return user as null | (T extends true ? UserPrismaWithFunctionsInterface : UserPrismaInterface);
	}

	async getUserById<T extends boolean>(
		id: string,
		includeFunctions: T = false as T,
	): Promise<null | (T extends true ? UserPrismaWithFunctionsInterface : UserPrismaInterface)> {
		const user = await prisma.user.findUnique({
			where: { id },
			...(includeFunctions ? {} : { omit: { validatePassword: true } }),
		});

		return user as null | (T extends true ? UserPrismaWithFunctionsInterface : UserPrismaInterface);
	}

	async getUsers(query: getUsersPrismaInterface): Promise<null | UserPrismaInterface[]> {
		const { filters = {}, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'asc' } = query;

		const skip = (page - 1) * limit;

		return prisma.user.findMany({
			omit: { validatePassword: true },
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

	async updateUserByEmail(email: string, data: UserUpdateInput): Promise<UserPrismaInterface> {
		return prisma.user.update({
			data: data,
			omit: { validatePassword: true },
			where: {
				email,
			},
		});
	}

	async updateUserById(id: string, data: UserUpdateInput): Promise<UserPrismaInterface> {
		return prisma.user.update({
			data: data,
			omit: { validatePassword: true },
			where: {
				id,
			},
		});
	}
}

export default UserPrismaService;
