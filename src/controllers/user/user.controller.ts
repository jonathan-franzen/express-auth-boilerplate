import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { UserRequestExpressInterface } from '@/interfaces/express/express.interfaces.js';
import HttpErrorService from '@/services/http-error/http-error.service.js';
import JwtService from '@/services/jwt/jwt.service.js';
import UserTokenPrismaService from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Request, Response } from 'express';

class UserController {
	constructor(
		private readonly userPrismaService: UserPrismaService,
		private readonly userTokenPrismaService: UserTokenPrismaService,
		private readonly jwtService: JwtService,
		private readonly httpErrorService: HttpErrorService,
	) {}

	async deleteUser(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const { id } = req.params;

		if (id === req.user.id) {
			throw this.httpErrorService.unableToDeleteSelfError();
		}

		const { error } = await until(() => this.userPrismaService.deleteUser(id));

		if (error) {
			if (this.userPrismaService.recordNotExistError(error)) {
				throw this.httpErrorService.notFoundError();
			} else {
				logger.alert({ context: { error, userId: id }, message: 'Failed to delete user.' });

				throw this.httpErrorService.internalServerError();
			}
		}

		return res.sendStatus(204);
	}

	getMe(req: UserRequestExpressInterface, res: Response): Response {
		const { createdAt, updatedAt, ...me } = req.user;
		return res.status(200).json({ me, message: 'Success.' });
	}

	async getUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		const user = await this.userPrismaService.getUserById(id);

		if (!user) {
			logger.warning({
				context: {
					id,
				},
				message: 'User ID not found.',
			});

			throw this.httpErrorService.notFoundError();
		}

		return res.status(200).json({ message: 'Success.', user });
	}

	async getUsers(req: Request, res: Response): Promise<Response> {
		const page = req.query.page ? Number(req.query.page as string) : undefined;
		const limit = req.query.limit ? Number(req.query.limit as string) : undefined;
		const filters = req.query.filters ? (JSON.parse(req.query.filters as string) as Record<string, string>) : {};
		const sortBy = (req.query.sortBy as string) || 'createdAt';
		const sortOrder = req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc' ? req.query.sortOrder : 'asc';

		const [users, totalCount] = await Promise.all([
			this.userPrismaService.getUsers({ filters, limit, page, sortBy, sortOrder }),
			this.userPrismaService.getUsersCount(filters),
		]);

		if (!users || users.length === 0) {
			return res.sendStatus(204);
		}

		return res.status(200).json({
			message: 'Success.',
			pagination: {
				limit,
				page,
				totalPages: Math.ceil(limit ? totalCount / limit : 1),
			},
			users,
		});
	}

	async patchMe(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const userUpdateInput = req.body as Record<string, string>;

		if (userUpdateInput.email && userUpdateInput.email !== req.user.email) {
			const duplicate = await this.userPrismaService.getUserByEmail(userUpdateInput.email);

			if (duplicate) {
				throw this.httpErrorService.emailAlreadyInUseError();
			}
		}

		const { createdAt, updatedAt, ...me } = await this.userPrismaService.updateUserById(req.user.id, { ...userUpdateInput });

		return res.status(200).json({ me, message: 'Success.' });
	}

	async patchUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;
		const userUpdateInput = req.body as Record<string, string>;

		if (userUpdateInput.email) {
			const potentialDuplicate = await this.userPrismaService.getUserByEmail(userUpdateInput.email);

			if (potentialDuplicate?.id && potentialDuplicate?.id !== id) {
				throw this.httpErrorService.emailAlreadyInUseError();
			}
		}
		const user = await this.userPrismaService.updateUserById(id, { ...userUpdateInput });

		return res.status(200).json({ message: 'Success.', user });
	}

	async postMeUpdatePassword(req: UserRequestExpressInterface, res: Response): Promise<Response> {
		const { newPassword, password } = req.body as Record<string, string>;

		// We need to fetch user again, since we need the password which is not provided by middleware passport.
		const user = await this.userPrismaService.getUserById(req.user.id, true);

		if (!user) {
			logger.alert({
				context: {
					id: req.user.id,
				},
				message: 'Attempt to update password for non-existing user.',
			});

			throw this.httpErrorService.internalServerError();
		}

		const passwordsMatch = await user.validatePassword(password);

		if (!passwordsMatch) {
			logger.warning({
				context: {
					email: user.email,
				},
				message: 'Incorrect password.',
			});

			throw this.httpErrorService.incorrectPasswordError();
		}

		await this.userTokenPrismaService.deleteUserTokens(user.id);

		await this.userPrismaService.updateUserByEmail(user.email, {
			password: newPassword,
		});

		const accessToken = this.jwtService.signAccessToken(user.id, user.email);
		const refreshToken = this.jwtService.signRefreshToken(user.email);

		await this.userTokenPrismaService.createUserToken({
			token: refreshToken,
			userId: user.id,
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: REFRESH_TOKEN_LIFETIME * 1000,
			sameSite: 'none',
			secure: process.env.APP_ENV === 'prod',
		});

		return res.status(200).json({
			accessToken,
			message: 'Password successfully updated.',
		});
	}
}

export default UserController;
