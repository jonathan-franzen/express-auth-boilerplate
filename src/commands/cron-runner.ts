import cron from 'node-cron'

import { deleteExpiredTokens } from '@/commands/db/delete-expired-tokens.db.command.js'
import { logger } from '@/utils/logger.js'

cron.schedule('0 0 * * * *', deleteExpiredTokens)

logger.info('Cron runner started')
