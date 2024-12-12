import deleteExpiredTokensDbCommand from '@/commands/db/delete-expired-tokens.db.command.js';
import seedDbCommand from '@/commands/db/seed.db.command.js';
import { Command } from 'commander';

const dbCommands: Command[] = [seedDbCommand, deleteExpiredTokensDbCommand];

export default dbCommands;
