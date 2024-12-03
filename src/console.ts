import { seedDbCommand } from '@/commands/db/seed.db.command.js';
import { Command } from 'commander';

export const console = new Command();

console.name('Node Console').description('CLI Console for Node.').version('1.0.0');

console.addCommand(seedDbCommand);

console.parse(process.argv);
