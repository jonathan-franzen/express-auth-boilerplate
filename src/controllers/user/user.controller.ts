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

			throw this.httpErrorService.notFoundError();
		}

		return res.status(200).json({ message: 'Success.', user });
	}

	async deleteUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		const deleteUser = await until(() => this.userPrismaService.deleteUser(id));

		if (deleteUser.error) {
			if (this.userPrismaService.recordNotExistError(deleteUser.error)) {
				throw this.httpErrorService.notFoundError();
			} else {
				logger.alert({ message: 'Failed to delete user.', context: { userId: id } });

				throw this.httpErrorService.internalServerError();
			}
		}

		return res.sendStatus(204);
	}
}

export default UserController;
