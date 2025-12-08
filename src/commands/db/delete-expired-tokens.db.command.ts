import { until } from '@open-draft/until'
import { Command } from 'commander'

import { resetPasswordTokenService } from '@/server/services/reset-password-token/index.js'
import { userTokenService } from '@/server/services/user-token/index.js'
import { logger } from '@/utils/logger.js'

export const deleteExpiredTokens = async () => {
  const [resetPasswordTokensError] = await until(() =>
    resetPasswordTokenService.deleteExpiredResetPasswordTokens()
  )

  const [refreshTokensError] = await until(() =>
    userTokenService.deleteExpiredUserTokens()
  )

  if (resetPasswordTokensError || refreshTokensError) {
    logger.alert('Error deleting expired tokens.', {
      context: {
        error: resetPasswordTokensError || refreshTokensError,
      },
    })
    throw new Error('Error deleting expired tokens.')
  }

  logger.info('Tokens deleted successfully.')
}

export const deleteExpiredTokensDbCommand = new Command(
  'db:delete-expired-tokens'
)
  .description('Delete expired tokens in database')
  .action(deleteExpiredTokens)
