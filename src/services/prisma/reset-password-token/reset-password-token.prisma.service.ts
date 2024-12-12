import { prisma } from '@/config/prisma.config.js';
import { Prisma, ResetPasswordToken } from '@prisma/client';

import BatchPayload = Prisma.BatchPayload;
import ResetPasswordTokenWhereInput = Prisma.ResetPasswordTokenWhereInput;

export class ResetPasswordTokenPrismaService {
	async getResetPasswordToken(token: string): Promise<ResetPasswordToken | null> {
		return prisma.resetPasswordToken.findUnique({
			where: {
				token,
			},
		});
	}

	async createOrUpdateResetPasswordToken(token: string, userId: string): Promise<ResetPasswordToken> {
		return prisma.resetPasswordToken.upsert({
			where: {
				userId,
			},
			update: {
				token,
			},
			create: {
				token,
				userId,
			},
		});
	}

	async deleteResetPasswordToken(token: string): Promise<ResetPasswordToken> {
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
}
