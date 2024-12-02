import { prisma } from '@/config/prisma.config.js';
import { ResetPasswordToken } from '@prisma/client';

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
				token: token,
			},
			create: {
				token: token,
				userId: userId,
			},
		});
	}

	async deleteResetPasswordToken(token: string): Promise<ResetPasswordToken> {
		return prisma.resetPasswordToken.delete({
			where: {
				token: token,
			},
		});
	}
}
