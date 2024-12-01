import { prisma } from '@/config/prisma.config.js';
import { Prisma } from '@prisma/client';
import { encryptionService } from '@/services/encryption/index.js';

function getUsers(): Prisma.UserCreateInput[] {
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

async function seed(): Promise<void> {
	const users: Prisma.UserCreateInput[] = getUsers();
	users.map(async (user: Prisma.UserCreateInput): Promise<void> => {
		const hashedPassword: string = await encryptionService.hash(user.password);
		await prisma.user.create({
			data: {
				email: user.email,
				password: hashedPassword,
				firstName: user.firstName,
				lastName: user.lastName,
			},
		});
	});
}

void seed();
