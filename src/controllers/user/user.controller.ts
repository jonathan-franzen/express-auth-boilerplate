import { StatusError } from '@/errors/status.error.js';
import { UserRequestExpressInterface } from '@/interfaces/express/user-request.express.interface.js';
import { UserPrismaService } from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';

import UserGetPayload = Prisma.UserGetPayload;
import PrismaClientUnknownRequestError = Prisma.PrismaClientUnknownRequestError;

export class UserController {
	constructor(private readonly userPrismaService: UserPrismaService) {}

	async getAllUsers(_req: Request, res: Response): Promise<Response> {
		const users: UserGetPayload<{ omit: { password: true } }>[] | null = await this.userPrismaService.getAllUsers({ password: true });

		if (!users) {
			return res.status(204).json({ message: 'No users found.' });
		}

		return res.json(users);
	}

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

			throw new StatusError(`User ID ${id} not found.`, 404);
		}

		return res.json(user);
	}

	async deleteUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			await this.userPrismaService.deleteUser(id);

			return res.sendStatus(204);
		} catch (err) {
			if (err instanceof PrismaClientUnknownRequestError) {
				throw new StatusError(`User ID ${id} not found.`, 404);
			} else {
				throw err;
			}
		}
	}

	async getMe(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized.' });
		}

		const { createdAt, updatedAt, ...me } = req.user;
		return res.json(me);
	}

	async patchMe(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized.' });
		}

		const { ...userUpdateInput } = req.body;
		if (req.body.email && req.body.email !== req.user.email) {
			const duplicate: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(req.body.email, {
				password: true,
				roles: true,
			});

			if (duplicate) {
				return res.status(409).json({ message: 'Email already exists.' });
			}
		}
		const me: User = await this.userPrismaService.updateUser({ id: req.user.id }, { ...userUpdateInput });
		return res.json(me);
	}
}
