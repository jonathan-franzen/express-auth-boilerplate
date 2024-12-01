import { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { JwtService } from '@/services/jwt/jwt.service.js';
import { Prisma, Role, User } from '@prisma/client';
import { UserPrismaService } from '@/services/prisma/user/user.prisma.service.js';
import { CustomError } from '@/utils/custom-error.js';
import logger from '@/utils/logger.js';
import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { UserTokenPrismaService } from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserTokenInclude = Prisma.UserTokenInclude;
import UserTokenGetPayload = Prisma.UserTokenGetPayload;
import { BcryptService } from '@/services/bcrypt/bcrypt.service.js';

export class AuthController {
	constructor(
		private readonly jwtService: JwtService,
		private readonly encryptionService: BcryptService,
		private readonly userPrismaService: UserPrismaService,
		private readonly userTokenPrismaService: UserTokenPrismaService,
	) {}

	async register(req: Request, res: Response): Promise<Response> {
		const { email, password, firstName, lastName } = req.body;

		const duplicate: User | null =
			await this.userPrismaService.getUserByEmail(email);

		if (duplicate) {
			logger.warning({
				message: 'User not created. Email already in use.',
				context: {
					email,
				},
			});

			throw new CustomError('Email already in use.', 409);
		}

		const hashedPassword: string = await this.encryptionService.hash(password);

		const createdUser: User = await this.userPrismaService.createUser({
			email,
			password: hashedPassword,
			firstName,
			lastName,
		});

		return res.status(201).json({
			message: 'User registered successfully.',
			email: createdUser.email,
		});
	}

	async login(req: Request, res: Response): Promise<Response> {
		const { email, password } = req.body;
		const { jwt } = req.cookies;

		const user: User | null =
			await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			logger.warning({
				message: 'User does not exist.',
				context: {
					email,
				},
			});

			throw new CustomError('User does not exist.', 401);
		}

		const passwordsMatch: boolean = await this.encryptionService.compare(
			password,
			user.password,
		);

		if (!passwordsMatch) {
			logger.warning({
				message: 'Incorrect password.',
				context: {
					email,
				},
			});

			throw new CustomError('Incorrect password.', 401);
		}

		const accessToken: string = this.jwtService.signAccessToken(
			user.email,
			user.roles,
		);
		const refreshToken: string = this.jwtService.signRefreshToken(user.email);

		if (jwt) {
			try {
				await this.userTokenPrismaService.deleteUserToken(jwt);
			} catch (err) {
				if (err instanceof Prisma.PrismaClientUnknownRequestError) {
					logger.alert({
						message: 'Attempted refresh token reuse at login.',
						context: {
							email,
						},
					});

					await this.userTokenPrismaService.deleteAllUserUserTokens(user.id);
				} else {
					throw err;
				}
			}
			res.clearCookie('jwt', {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
			});
		}

		await this.userTokenPrismaService.createUserToken({
			token: refreshToken,
			userId: user.id,
		});

		res.cookie('jwt', refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: REFRESH_TOKEN_LIFETIME,
		});

		return res.json({ accessToken });
	}

	async refresh(req: Request, res: Response): Promise<Response> {
		const { jwt } = req.cookies;

		res.clearCookie('jwt', { httpOnly: true, secure: false, sameSite: 'lax' });

		const userToken: UserTokenGetPayload<{ include: UserTokenInclude }> | null =
			await this.userTokenPrismaService.getUserTokenByToken(jwt, {
				user: true,
			});

		if (!userToken) {
			this.jwtService.verifyRefreshToken(
				jwt,
				false,
				async (decoded: JwtPayload): Promise<void> => {
					const foundUser: User | null =
						await this.userPrismaService.getUserByEmail(decoded.email);
					if (foundUser) {
						await this.userTokenPrismaService.deleteAllUserUserTokens(
							foundUser.id,
						);
						logger.alert({
							message: 'Attempted reuse of refresh token mitigated.',
							context: {
								email: foundUser.email,
							},
						});
					}
				},
			);
			throw new CustomError('Refresh token invalid.', 403);
		}

		const accessToken: string | void = this.jwtService.verifyRefreshToken(
			jwt,
			true,
			async (decoded: JwtPayload): Promise<string> => {
				const roles: Role[] = userToken.user.roles;
				const accessToken: string = this.jwtService.signAccessToken(
					decoded.email,
					roles,
				);

				const newRefreshToken: string = this.jwtService.signRefreshToken(
					decoded.email,
				);

				await this.userTokenPrismaService.createUserToken({
					userId: userToken.userId,
					token: newRefreshToken,
				});

				res.cookie('jwt', newRefreshToken, {
					httpOnly: true,
					secure: false,
					sameSite: 'lax',
					maxAge: REFRESH_TOKEN_LIFETIME,
				});

				return accessToken;
			},
		);
		return res.json({ accessToken });
	}

	async logout(req: Request, res: Response): Promise<Response> {
		const { jwt } = req.cookies;

		if (!jwt) {
			return res.sendStatus(204);
		}

		try {
			await this.userTokenPrismaService.deleteUserToken(jwt);
		} catch (err) {
			if (!(err instanceof Prisma.PrismaClientUnknownRequestError)) {
				throw err;
			}
		}

		res.clearCookie('jwt', { httpOnly: true, secure: false, sameSite: 'lax' });
		return res.sendStatus(204);
	}
}
