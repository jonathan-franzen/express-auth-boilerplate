import bcryptService from '@/services/bcrypt/index.js';
import { Prisma } from '@prisma/client';
import { PayloadToResult } from '@prisma/client/runtime/binary';

import $UserPayload = Prisma.$UserPayload;

export const user = Prisma.defineExtension({
	query: {
		user: {
			async create({ args, query }): Promise<PayloadToResult<$UserPayload>> {
				if (args.data.password) {
					args.data.password = await bcryptService.hash(args.data.password as string);
				}
				return query(args);
			},
			async update({ args, query }): Promise<PayloadToResult<$UserPayload>> {
				if (args.data.password) {
					args.data.password = await bcryptService.hash(args.data.password as string);
				}
				return query(args);
			},
		},
	},
	result: {
		user: {
			validatePassword: {
				compute:
					(user: { password: string }): ((rawPassword: string) => Promise<boolean>) =>
					async (rawPassword: string): Promise<boolean> => {
						const hash = user.password;

						if (!hash) {
							return false;
						}

						return await bcryptService.compare(rawPassword, hash);
					},
				needs: { password: true },
			},
		},
	},
});
