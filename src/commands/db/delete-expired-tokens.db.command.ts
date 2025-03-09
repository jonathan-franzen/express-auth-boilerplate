import resetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/index.js';
import userTokenPrismaService from '@/services/prisma/user-token/index.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Command } from 'commander';

const deleteExpiredTokensDbCommand = new Command('db:delete-expired-tokens').description('Delete expired tokens in database').action(deleteExpiredTokens);

async function deleteExpiredTokens(): Promise<void> {
	const deleteResetPasswordTokens = await until(() => resetPasswordTokenPrismaService.deleteExpiredResetPasswordTokens());

	const deleteRefreshTokens = await until(() => userTokenPrismaService.deleteExpiredUserTokens());

	if (deleteResetPasswordTokens.error || deleteRefreshTokens.error) {
		logger.error('Error deleting expired tokens:', deleteResetPasswordTokens.error || deleteRefreshTokens.error);
		throw new Error('Error deleting expired tokens.');
	}

	logger.info('Tokens deleted successfully.');
}

export default deleteExpiredTokensDbCommand;
