import { prisma } from '@/config/prisma/prisma.config.js';
import { UserTokenPrismaInterface } from '@/interfaces/prisma/user-token/user-token.prisma.interfaces.js';
import PrismaService from '@/services/prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

import BatchPayload = Prisma.BatchPayload;
import UserTokenUncheckedCreateInput = Prisma.UserTokenUncheckedCreateInput;
import UserTokenWhereInput = Prisma.UserTokenWhereInput;

class UserTokenPrismaService extends PrismaService {
	async createUserToken(userTokenCreateInput: UserTokenUncheckedCreateInput): Promise<UserTokenPrismaInterface> {
		return prisma.userToken.create({
			data: userTokenCreateInput,
		});
	}

	async deleteUserToken(token: string): Promise<UserTokenPrismaInterface> {
		return prisma.userToken.delete({
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

	async getUserTokenByToken(token: string): Promise<null | UserTokenPrismaInterface> {
		return prisma.userToken.findUnique({
			where: {
				token,
			},
		});
	}
}

export default UserTokenPrismaService;
