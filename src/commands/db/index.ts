import { deleteExpiredTokensDbCommand } from '@/commands/db/delete-expired-tokens.db.command.js'
import { seedDbCommand } from '@/commands/db/seed.db.command.js'

export const dbCommands = [seedDbCommand, deleteExpiredTokensDbCommand]
