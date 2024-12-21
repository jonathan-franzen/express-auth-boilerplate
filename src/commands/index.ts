import dbCommands from '@/commands/db/index.js';
import { Command } from 'commander';

export const commander = new Command();

commander.name('Node Commander').description('Command Console for Node.');

dbCommands.forEach((cmd: Command): Command => commander.addCommand(cmd));

commander.parse(process.argv);
