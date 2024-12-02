import { UserPrismaService } from '@/services/prisma/user/user.prisma.service.js';
import { CustomError } from '@/utils/custom-error.js';
import logger from '@/utils/logger.js';
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';

import UserGetPayload = Prisma.UserGetPayload;
import UserOmit = Prisma.UserOmit;

export class UserController {
	constructor(private readonly userPrismaService: UserPrismaService) {}

	async getUserById(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		const user: User | null = await this.userPrismaService.getUserById(id);

		if (!user) {
			logger.warning({
				message: 'User ID not found.',
				context: {
					id,
				},
			});

			throw new CustomError(`User ID ${id} not found.`, 404);
		}

		return res.json(user);
	}

	async getAllUsers(res: Response): Promise<Response> {
		const users: UserGetPayload<{ omit: UserOmit }>[] | null = await this.userPrismaService.getAllUsers({ password: true, roles: true });

		if (!users) {
			return res.status(204).json({ message: 'No users found.' });
		}

		return res.json(users);
	}

	async deleteUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			await this.userPrismaService.deleteUser(id);

			return res.sendStatus(204);
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw new CustomError(`User ID ${id} not found.`, 404);
			} else {
				throw err;
			}
		}
	}
}
