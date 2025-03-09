import { prisma } from '@/config/prisma/prisma.config.js';
import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants';
import { UserTokenPrismaInterface } from '@/interfaces/prisma/user-token/user-token.prisma.interfaces.js';
import PrismaService from '@/services/prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

import BatchPayload = Prisma.BatchPayload;
import UserTokenUncheckedCreateInput = Prisma.UserTokenUncheckedCreateInput;

class UserTokenPrismaService extends PrismaService {
	async createUserToken(userTokenCreateInput: UserTokenUncheckedCreateInput): Promise<UserTokenPrismaInterface> {
		return prisma.userToken.create({
			data: userTokenCreateInput,
		});
	}

	async deleteExpiredUserTokens(): Promise<BatchPayload> {
		return prisma.userToken.deleteMany({
			where: {
				updatedAt: {
					lt: new Date(Date.now() - REFRESH_TOKEN_LIFETIME),
				},
			},
		});
	}

	async deleteUserToken(token: string): Promise<UserTokenPrismaInterface> {
		return prisma.userToken.delete({
			where: {
				token,
			},
		});
	}

	async deleteUserTokens(userId: string): Promise<BatchPayload> {
		return prisma.userToken.deleteMany({
			where: {
				userId,
			},
		});
	}

	async getUserTokenByToken(token: string): Promise<null | UserTokenPrismaInterface> {
		return prisma.userToken.findUnique({
			where: {
				token,
			},
		});
	}
}

export default UserTokenPrismaService;
