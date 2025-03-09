import 'tsconfig-paths/register';
import dbCommands from '@/commands/db/index.js';
import { AWS_LAMBDA_FUNCTION_NAME } from '@/constants/environment.constants.js';
import { Command } from 'commander';

export const commander = new Command();

commander.name('Node Commander').description('Command Console for Node.');

for (const cmd of dbCommands) {
	commander.addCommand(cmd);
}

if (!AWS_LAMBDA_FUNCTION_NAME) {
	commander.parse(process.argv);
}
