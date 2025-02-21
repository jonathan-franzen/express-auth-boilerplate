import { prisma } from '@/config/prisma/prisma.config.js';
import { ResetPasswordTokenPrismaInterface } from '@/interfaces/prisma/reset-password-token/reset-password-token.prisma.interfaces.js';
import PrismaService from '@/services/prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

import BatchPayload = Prisma.BatchPayload;
import ResetPasswordTokenWhereInput = Prisma.ResetPasswordTokenWhereInput;

class ResetPasswordTokenPrismaService extends PrismaService {
	async createOrUpdateResetPasswordToken(token: string, userId: string): Promise<ResetPasswordTokenPrismaInterface> {
		return prisma.resetPasswordToken.upsert({
			create: {
				token,
				userId,
			},
			update: {
				token,
			},
			where: {
				userId,
			},
		});
	}

	async deleteResetPasswordToken(token: string): Promise<ResetPasswordTokenPrismaInterface> {
		return prisma.resetPasswordToken.delete({
			where: {
				token,
			},
		});
	}

	async deleteResetPasswordTokens(where: ResetPasswordTokenWhereInput): Promise<BatchPayload> {
		return prisma.resetPasswordToken.deleteMany({
			where: where,
		});
	}

	async getResetPasswordToken(token: string): Promise<null | ResetPasswordTokenPrismaInterface> {
		return prisma.resetPasswordToken.findUnique({
			where: {
				token,
			},
		});
	}
}

export default ResetPasswordTokenPrismaService;
