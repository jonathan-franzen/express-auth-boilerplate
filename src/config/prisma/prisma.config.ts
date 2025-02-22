import { user } from '@/config/prisma/extensions/user.extension.prisma.config.js';
import { PrismaClient } from '@prisma/client';

export type PrismaTransaction = Parameters<Parameters<DbClient['$transaction']>[0]>[0];
type DbClient = ReturnType<typeof createClient>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createClient = () => {
	return new PrismaClient({
		omit: {
			user: {
				password: true,
			},
		},
	}).$extends(user);
};

export const prisma = createClient();
