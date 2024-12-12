import { prisma } from '@/config/prisma.config.js';
import { Prisma, UserToken } from '@prisma/client';

import BatchPayload = Prisma.BatchPayload;
import UserTokenUncheckedCreateInput = Prisma.UserTokenUncheckedCreateInput;
import UserTokenInclude = Prisma.UserTokenInclude;
import UserTokenGetPayload = Prisma.UserTokenGetPayload;
import UserTokenWhereInput = Prisma.UserTokenWhereInput;
import PrismaService from '@/services/prisma/prisma.service.js';

export default class UserTokenPrismaService extends PrismaService {
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

	async deleteUserTokens(where: UserTokenWhereInput): Promise<BatchPayload> {
		return prisma.userToken.deleteMany({
			where: where,
		});
	}
}
