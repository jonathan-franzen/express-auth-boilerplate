import dbCommands from '@/commands/db/index.js';
import { Command } from 'commander';

export const commander = new Command();

commander.name('Node Console').description('CLI Console for Node.').version('1.0.0');

dbCommands.forEach((cmd: Command): Command => commander.addCommand(cmd));

commander.parse(process.argv);
