import UserRequestExpressInterface from '@/interfaces/express/user-request.express.interface.js';
import HttpErrorService from '@/services/http-error/http-error.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';

import UserGetPayload = Prisma.UserGetPayload;

class UserController {
	constructor(
		private readonly userPrismaService: UserPrismaService,
		private readonly httpErrorService: HttpErrorService,
	) {}

	async getMe(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const { createdAt, updatedAt, ...me } = req.user;

		return res.status(200).json({ message: 'Success.', me });
	}

	async patchMe(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const { ...userUpdateInput } = req.body;

		if (req.body.email && req.body.email !== req.user.email) {
			const duplicate: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(req.body.email, {
				password: true,
				roles: true,
			});

			if (duplicate) {
				throw this.httpErrorService.emailAlreadyInUseError();
			}
		}
		const me = await this.userPrismaService.updateUser({ id: req.user.id }, { ...userUpdateInput });

		return res.status(200).json({ message: 'Success.', me });
	}

	async getAllUsers(req: Request, res: Response): Promise<Response> {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};
		const sortBy = (req.query.sortBy as string) || 'createdAt';
		const sortOrder = req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc' ? req.query.sortOrder : 'asc';

		const [users, totalCount] = await Promise.all([
			this.userPrismaService.getAllUsers({ password: true }, page, limit, filters, sortBy, sortOrder),
			this.userPrismaService.getUsersCount(filters),
		]);

		if (!users || users.length === 0) {
			return res.sendStatus(204);
		}

		return res.status(200).json({
			message: 'Success.',
			users,
			pagination: {
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit),
			},
		});
	}

	async getUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		const user = await this.userPrismaService.getUserById(id);

		if (!user) {
			logger.warning({
				message: 'User ID not found.',
				context: {
					id,
				},
			});

			throw this.httpErrorService.notFoundError();
		}

		return res.status(200).json({ message: 'Success.', user });
	}

	async patchUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;
		const { ...userUpdateInput } = req.body;

		if (req.body.email) {
			const potentialDuplicate: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(req.body.email, {
				password: true,
				roles: true,
			});

			if (potentialDuplicate?.id && potentialDuplicate?.id !== id) {
				throw this.httpErrorService.emailAlreadyInUseError();
			}
		}
		const user = await this.userPrismaService.updateUser({ id }, { ...userUpdateInput });

		return res.status(200).json({ message: 'Success.', user });
	}

	async deleteUser(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const { id } = req.params;

		if (id === req.user.id) {
			throw this.httpErrorService.unableToDeleteSelfError();
		}

		const deleteUser = await until((): Promise<User> => this.userPrismaService.deleteUser(id));

		if (deleteUser.error) {
			if (this.userPrismaService.recordNotExistError(deleteUser.error)) {
				throw this.httpErrorService.notFoundError();
			} else {
				logger.alert({ message: 'Failed to delete user.', context: { userId: id, error: deleteUser.error } });

				throw this.httpErrorService.internalServerError();
			}
		}

		return res.sendStatus(204);
	}
}

export default UserController;
