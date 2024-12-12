import { REFRESH_TOKEN_LIFETIME, RESET_PASSWORD_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { resetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/index.js';
import { userTokenPrismaService } from '@/services/prisma/user-token/index.js';
import logger from '@/utils/logger.js';
import { Command } from 'commander';

export const deleteExpiredTokensDbCommand: Command = new Command('db:delete-expired-tokens')
	.description('Delete expired tokens in database')
	.action(deleteExpiredTokens);

async function deleteExpiredTokens(): Promise<void> {
	try {
		await resetPasswordTokenPrismaService.deleteResetPasswordTokens({
			updatedAt: {
				lt: new Date(Date.now() - RESET_PASSWORD_TOKEN_LIFETIME),
			},
		});

		await userTokenPrismaService.deleteUserTokens({
			updatedAt: {
				lt: new Date(Date.now() - REFRESH_TOKEN_LIFETIME),
			},
		});

		logger.info('Tokens deleted successfully.');
	} catch (error) {
		logger.error('Error deleting expired tokens:', error);
		process.exit(1);
	}
}
