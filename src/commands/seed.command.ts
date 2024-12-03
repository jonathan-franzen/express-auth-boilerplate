import { prisma } from '@/config/prisma.config.js';
import { bcryptService } from '@/services/bcrypt/index.js';
import logger from '@/utils/logger.js';
import { Prisma } from '@prisma/client';
import { Command } from 'commander';

import UserCreateInput = Prisma.UserCreateInput;

export const seedCommand: Command = new Command('db:seed').description('Init database').action(seed);

function getUsers(): UserCreateInput[] {
	return [
		{
			email: 'admin@email.com',
			firstName: 'John',
			lastName: 'Doe',
			roles: ['USER', 'EDITOR', 'ADMIN'],
			password: 'admin',
		},
	];
}

async function createUser(user: UserCreateInput): Promise<void> {
	const hashedPassword: string = await bcryptService.hash(user.password);
	await prisma.user.create({
		data: {
			email: user.email,
			password: hashedPassword,
			firstName: user.firstName,
			lastName: user.lastName,
			roles: user.roles,
		},
	});
}

async function seed(): Promise<void> {
	const users: UserCreateInput[] = getUsers();

	try {
		await Promise.all(users.map((user: UserCreateInput): Promise<void> => createUser(user)));
		logger.info('Seeding completed successfully.');
	} catch (error) {
		logger.error('Error during database seeding:', error);
		process.exit(1);
	}
}
