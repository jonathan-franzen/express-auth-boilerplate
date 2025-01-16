import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import UserRequestExpressInterface from '@/interfaces/express/user-request.express.interface.js';
import BcryptService from '@/services/bcrypt/bcrypt.service.js';
import HttpErrorService from '@/services/http-error/http-error.service.js';
import JwtService from '@/services/jwt/jwt.service.js';
import UserTokenPrismaService from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';

import UserGetPayload = Prisma.UserGetPayload;

class UserController {
	constructor(
		private readonly userPrismaService: UserPrismaService,
		private readonly userTokenPrismaService: UserTokenPrismaService,
		private readonly bcryptService: BcryptService,
		private readonly jwtService: JwtService,
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

	async postMeResetPassword(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const { password, newPassword } = req.body;

		// We need to fetch user again, since we need the password which is not provided by middleware passport.
		const user = await this.userPrismaService.getUserById(req.user.id);

		if (!user) {
			logger.alert({
				message: 'User not found when trying to reset password.',
				context: {
					id: req.user.id,
				},
			});

			throw this.httpErrorService.internalServerError();
		}

		const passwordsMatch: boolean = await this.bcryptService.compare(password, user.password);

		if (!passwordsMatch) {
			logger.warning({
				message: 'Incorrect password.',
				context: {
					email: user.email,
				},
			});

			throw this.httpErrorService.invalidCredentialsError();
		}

		const hashedNewPassword = await this.bcryptService.hash(newPassword);

		await this.userTokenPrismaService.deleteUserTokens({ userId: user.id });

		await this.userPrismaService.updateUser(
			{ email: user.email },
			{
				password: hashedNewPassword,
			},
		);

		const accessToken = this.jwtService.signAccessToken(user.id, user.email);
		const refreshToken = this.jwtService.signRefreshToken(user.email);

		await this.userTokenPrismaService.createUserToken({
			userId: user.id,
			token: refreshToken,
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.APP_ENV === 'prod',
			sameSite: 'none',
			maxAge: REFRESH_TOKEN_LIFETIME * 1000,
		});

		return res.status(200).json({
			message: 'Password successfully updated.',
			accessToken,
		});
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
