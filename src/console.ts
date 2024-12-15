import { exec } from 'child_process';
import { until } from '@open-draft/until';

export const handler = async (command: string): Promise<void> => {
	const { data, error } = await until(
		() =>
			new Promise<string>((resolve, reject) => {
				exec(command, (error, stdout, stderr) => {
					if (error) {
						reject(stderr || error.message);
					} else {
						resolve(stdout);
					}
				});
			}),
	);

	if (error) {
		error.message.split('\n').forEach((line) => {
			if (line.trim()) {
				console.error(line);
			}
		});
		return;
	}

	data.split('\n').forEach((line) => {
		if (line.trim()) {
			console.log(line);
		}
	});
};
