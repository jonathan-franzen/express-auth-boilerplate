import { seedCommand } from '@/commands/seed.command.js';
import { Command } from 'commander';

export const program = new Command();

program.name('Node Console').description('CLI Console for Node.').version('1.0.0');

program.addCommand(seedCommand);

program.parse(process.argv);
