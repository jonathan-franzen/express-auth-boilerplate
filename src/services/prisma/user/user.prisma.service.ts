import { prisma } from '@/config/prisma.config.js';
import { Prisma, User } from '@prisma/client';

import UserCreateInput = Prisma.UserCreateInput;
import UserOmit = Prisma.UserOmit;
import UserGetPayload = Prisma.UserGetPayload;
import UserUpdateInput = Prisma.UserUpdateInput;

export class UserPrismaService {
	async getUserById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: {
				id,
			},
		});
	}

	async getUserByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: {
				email,
			},
		});
	}

	async getAllUsers(omit: UserOmit): Promise<UserGetPayload<{ omit: UserOmit }>[] | null> {
		return prisma.user.findMany({
			omit: omit,
		});
	}

	async updateUserByEmail(email: string, data: UserUpdateInput): Promise<User | null> {
		return prisma.user.update({
			data: data,
			where: {
				email,
			},
		});
	}

	async createUser(userCreateInput: UserCreateInput): Promise<User> {
		return prisma.user.create({
			data: userCreateInput,
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
