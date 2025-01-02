import { prisma } from '@/config/prisma.config.js';
import PrismaService from '@/services/prisma/prisma.service.js';
import { Prisma, User } from '@prisma/client';

import UserCreateInput = Prisma.UserCreateInput;
import UserOmit = Prisma.UserOmit;
import UserGetPayload = Prisma.UserGetPayload;
import UserUpdateInput = Prisma.UserUpdateInput;
import UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

class UserPrismaService extends PrismaService {
	async getUserById(id: string, omit?: UserOmit): Promise<UserGetPayload<{ omit: UserOmit }> | null> {
		return prisma.user.findUnique({
			where: {
				id,
			},
			omit: omit,
		});
	}

	async getUserByEmail(email: string, omit?: UserOmit): Promise<UserGetPayload<{ omit: UserOmit }> | null> {
		return prisma.user.findUnique({
			where: {
				email,
			},
			omit: omit,
		});
	}

	async getAllUsers(
		omit: UserOmit,
		page: number = 1,
		limit: number = 10,
		filters: Record<string, any> = {},
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc',
	): Promise<UserGetPayload<{ omit: UserOmit }>[] | null> {
		const skip = (page - 1) * limit;

		return prisma.user.findMany({
			skip,
			take: limit,
			where: filters,
			orderBy: {
				[sortBy]: sortOrder,
			},
			omit,
		});
	}

	async getUsersCount(filters?: Record<string, any>): Promise<number> {
		return prisma.user.count({
			where: filters || {},
		});
	}

	async updateUser(where: UserWhereUniqueInput, data: UserUpdateInput): Promise<User> {
		return prisma.user.update({
			data: data,
			where: where,
		});
	}

	async createUser(userCreateInput: UserCreateInput): Promise<User> {
		return prisma.user.create({
			data: userCreateInput,
		});
	}

	async createOrUpdateUser(email: string, userUpdateInput: UserUpdateInput, userCreateInput: UserCreateInput): Promise<User> {
		return prisma.user.upsert({
			where: { email },
			update: userUpdateInput,
			create: userCreateInput,
		});
	}

	async deleteUser(id: string): Promise<User> {
		return prisma.user.delete({
			where: {
				id,
			},
		});
	}
}

export default UserPrismaService;
