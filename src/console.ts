import { exec } from 'child_process';

export const handler = async (command: string): Promise<void> => {
	try {
		const result = await new Promise<string>((resolve, reject) => {
			exec(command, (error, stdout, stderr) => {
				if (error) {
					reject(stderr || error.message);
				} else {
					resolve(stdout);
				}
			});
		});

		result.split('\n').forEach((line) => {
			if (line.trim()) {
				console.log(line);
			}
		});
	} catch (error) {
		const errorMessage = typeof error === 'string' ? error : (error as Error).message;
		errorMessage.split('\n').forEach((line) => {
			if (line.trim()) {
				console.error(line);
			}
		});
	}
};
