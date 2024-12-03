import dbCommands from '@/commands/db/index.js';
import { Command } from 'commander';

export const console = new Command();

console.name('Node Console').description('CLI Console for Node.').version('1.0.0');

dbCommands.forEach((cmd: Command): Command => console.addCommand(cmd));

console.parse(process.argv);
