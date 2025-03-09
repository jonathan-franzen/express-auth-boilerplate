import 'tsconfig-paths/register.js';
import { commander } from '@/commands/index.js';

export const handler = async (command: string): Promise<{ body?: string; error?: string; status: number }> => {
	if (!command) {
		return {
			error: 'No command provided.',
			status: 400,
		};
	}

	try {
		await commander.parseAsync(command.split(' '), { from: 'user' });

		return {
			body: `Command '${command}' executed successfully.`,
			status: 200,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Command failed due to unknown reason.',
			status: 500,
		};
	}
};
