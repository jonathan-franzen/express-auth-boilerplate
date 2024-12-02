import { prisma } from '@/config/prisma.config.js';
import { Prisma, UserToken } from '@prisma/client';

import BatchPayload = Prisma.BatchPayload;
import UserTokenUncheckedCreateInput = Prisma.UserTokenUncheckedCreateInput;
import UserTokenInclude = Prisma.UserTokenInclude;
import UserTokenGetPayload = Prisma.UserTokenGetPayload;

export class UserTokenPrismaService {
	async getUserTokenByToken(token: string, include: UserTokenInclude): Promise<UserTokenGetPayload<{ include: UserTokenInclude }> | null> {
		return prisma.userToken.findUnique({
			where: {
				token,
			},
			include: include,
		});
	}

	async createUserToken(userTokenCreateInput: UserTokenUncheckedCreateInput): Promise<UserToken> {
		return prisma.userToken.create({
			data: userTokenCreateInput,
		});
	}

	async deleteUserToken(token: string): Promise<BatchPayload> {
		return prisma.userToken.deleteMany({
			where: {
				token,
			},
		});
	}

	async deleteAllUserUserTokens(userId: string): Promise<BatchPayload> {
		return prisma.userToken.deleteMany({
			where: {
				userId,
			},
		});
	}
}
