import userPrismaService from '@/services/prisma/user/index.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Prisma, Role } from '@prisma/client';
import { Command } from 'commander';

import UserCreateInput = Prisma.UserCreateInput;

const seedDbCommand = new Command('db:seed').description('Init database').action(seed);

async function createUser(userCreateInput: UserCreateInput): Promise<void> {
	const user = {
		...userCreateInput,
		emailVerifiedAt: new Date(Date.now()),
	};

	await userPrismaService.createOrUpdateUser(user.email, { ...user });
}

function getUsers() {
	return [
		{
			email: 'admin@email.com',
			firstName: 'John',
			lastName: 'Doe',
			password: 'admin',
			roles: [Role.USER, Role.ADMIN],
		},
		{
			email: 'user@email.com',
			firstName: 'Don',
			lastName: 'Joe',
			password: 'user',
			roles: [Role.USER],
		},
	];
}

async function seed(): Promise<void> {
	const users = getUsers();

	const { error } = await until(() => Promise.all(users.map((user) => createUser(user))));

	if (error) {
		logger.error('Error during database seeding:', error);
		return process.exit(1);
	}

	logger.info('Seeding completed successfully.');
}

export default seedDbCommand;
