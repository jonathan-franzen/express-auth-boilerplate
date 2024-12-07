import { bcryptService } from '@/services/bcrypt/index.js';
import { userPrismaService } from '@/services/prisma/user/index.js';
import logger from '@/utils/logger.js';
import { Prisma } from '@prisma/client';
import { Command } from 'commander';

import UserCreateInput = Prisma.UserCreateInput;

export const seedDbCommand: Command = new Command('db:seed').description('Init database').action(seed);

function getUsers(): UserCreateInput[] {
	return [
		{
			email: 'admin@email.com',
			firstName: 'John',
			lastName: 'Doe',
			roles: ['USER', 'ADMIN'],
			password: 'admin',
		},
	];
}

async function createUser(userCreateInput: UserCreateInput): Promise<void> {
	const hashedPassword: string = await bcryptService.hash(userCreateInput.password);

	const user = {
		...userCreateInput,
		password: hashedPassword,
		emailVerifiedAt: new Date(Date.now()),
	};

	await userPrismaService.createOrUpdateUser(user.email, { ...user }, { ...user });
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
