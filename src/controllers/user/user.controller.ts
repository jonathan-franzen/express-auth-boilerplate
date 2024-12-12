import UserRequestExpressInterface from '@/interfaces/express/user-request.express.interface.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';

import UserGetPayload = Prisma.UserGetPayload;
import PrismaClientUnknownRequestError = Prisma.PrismaClientUnknownRequestError;

export default class UserController {
	constructor(private readonly userPrismaService: UserPrismaService) {}

	async getMe(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized.' });
		}

		const { createdAt, updatedAt, ...me } = req.user;
		return res.status(200).json({ message: 'Success.', me });
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
				return res.status(409).json({ error: 'Email already in use.' });
			}
		}
		const me: User = await this.userPrismaService.updateUser({ id: req.user.id }, { ...userUpdateInput });
		return res.status(200).json({ message: 'Success.', me });
	}

	async getAllUsers(_req: Request, res: Response): Promise<Response> {
		const users: UserGetPayload<{ omit: { password: true } }>[] | null = await this.userPrismaService.getAllUsers({ password: true });

		if (!users) {
			return res.sendStatus(204);
		}

		return res.status(200).json({ message: 'Success.', users });
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

			return res.status(404).json({ error: 'Not found.' });
		}

		return res.status(200).json({ message: 'Success.', user });
	}

	async deleteUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			await this.userPrismaService.deleteUser(id);

			return res.sendStatus(204);
		} catch (err) {
			if (err instanceof PrismaClientUnknownRequestError) {
				return res.status(404).json({ error: 'Not found.' });
			} else {
				logger.alert({ message: 'Failed to delete user.', context: { userId: id } });

				return res.status(500).json({ error: 'Internal server error.' });
			}
		}
	}
}
