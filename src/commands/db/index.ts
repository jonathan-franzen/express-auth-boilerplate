import { seedDbCommand } from '@/commands/db/seed.db.command.js';
import { Command } from 'commander';
import { deleteExpiredTokensDbCommand } from '@/commands/db/delete-expired-tokens.db.command.js';

const dbCommands: Command[] = [seedDbCommand, deleteExpiredTokensDbCommand];

export default dbCommands;
