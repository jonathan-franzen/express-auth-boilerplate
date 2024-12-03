import { seedDbCommand } from '@/commands/db/seed.db.command.js';
import { Command } from 'commander';

const dbCommands: Command[] = [seedDbCommand];

export default dbCommands;
