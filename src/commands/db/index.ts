import deleteExpiredTokensDbCommand from '@/commands/db/delete-expired-tokens.db.command.js';
import migrationDbCommand from '@/commands/db/migration.db.command.js';
import seedDbCommand from '@/commands/db/seed.db.command.js';

const dbCommands = [migrationDbCommand, seedDbCommand, deleteExpiredTokensDbCommand];

export default dbCommands;
