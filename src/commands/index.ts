import dbCommands from '@/commands/db/index.js';
import { Command } from 'commander';

export const commander = new Command();

commander.name('Node Commander').description('Command Console for Node.');

for (const cmd of dbCommands) {
	commander.addCommand(cmd);
}

commander.parse(process.argv);
