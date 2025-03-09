import logger from '@/utils/logger.js';
import { Command } from 'commander';
import execa from 'execa';

const migrationDbCommand = new Command('db:migration').description('Migrate database').action(async () => {
	try {
		await execa('node_modules/prisma/build/index.js', ['migrate', 'deploy'], { stdio: 'inherit' });
	} catch (error) {
		logger.error(error);
		throw new Error('Database migration failed.');
	}
});

export default migrationDbCommand;
