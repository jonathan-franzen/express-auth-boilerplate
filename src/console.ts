import { seedCommand } from '@/commands/seed.command.js';
import { Command } from 'commander';

export const console = new Command();

console.name('Node Console').description('CLI Console for Node.').version('1.0.0');

console.addCommand(seedCommand);

console.parse(process.argv);
