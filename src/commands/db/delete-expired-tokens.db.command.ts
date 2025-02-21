import { REFRESH_TOKEN_LIFETIME, RESET_PASSWORD_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import resetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/index.js';
import userTokenPrismaService from '@/services/prisma/user-token/index.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Command } from 'commander';

const deleteExpiredTokensDbCommand = new Command('db:delete-expired-tokens').description('Delete expired tokens in database').action(deleteExpiredTokens);

async function deleteExpiredTokens(): Promise<void> {
	const deleteResetPasswordTokens = await until(() =>
		resetPasswordTokenPrismaService.deleteResetPasswordTokens({
			updatedAt: {
				lt: new Date(Date.now() - RESET_PASSWORD_TOKEN_LIFETIME),
			},
		}),
	);

	const deleteRefreshTokens = await until(() =>
		userTokenPrismaService.deleteUserTokens({
			updatedAt: {
				lt: new Date(Date.now() - REFRESH_TOKEN_LIFETIME),
			},
		}),
	);

	if (deleteResetPasswordTokens.error || deleteRefreshTokens.error) {
		logger.error('Error deleting expired tokens:', deleteResetPasswordTokens.error || deleteRefreshTokens.error);
		process.exit(1);
	}

	logger.info('Tokens deleted successfully.');
}

export default deleteExpiredTokensDbCommand;
