import { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { JwtService } from '@/services/jwt/jwt.service.js';
import { Prisma, ResetPasswordToken, Role, User } from '@prisma/client';
import { UserPrismaService } from '@/services/prisma/user/user.prisma.service.js';
import { CustomError } from '@/utils/custom-error.js';
import logger from '@/utils/logger.js';
import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { UserTokenPrismaService } from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserTokenInclude = Prisma.UserTokenInclude;
import UserTokenGetPayload = Prisma.UserTokenGetPayload;
import { BcryptService } from '@/services/bcrypt/bcrypt.service.js';
import { ResetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import { MailerService } from '@/services/mailer/mailer.service.js';

export class AuthController {
	constructor(
		private readonly jwtService: JwtService,
		private readonly bcryptService: BcryptService,
		private readonly mailerService: MailerService,
		private readonly userPrismaService: UserPrismaService,
		private readonly userTokenPrismaService: UserTokenPrismaService,
		private readonly resetPasswordTokenPrismaService: ResetPasswordTokenPrismaService,
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

		const hashedPassword: string = await this.bcryptService.hash(password);

		const createdUser: User = await this.userPrismaService.createUser({
			email,
			password: hashedPassword,
			firstName,
			lastName,
		});

		const verifyToken: string = this.jwtService.signVerifyEmailToken(
			createdUser.email,
		);

		await this.mailerService.sendVerifyEmail(createdUser, verifyToken);

		return res.status(201).json({
			message: 'User registered successfully.',
			email: createdUser.email,
		});
	}

	async verifyEmail(req: Request, res: Response): Promise<Response> {
		const { verifyEmailToken } = req.params;

		this.jwtService.verifyVerifyEmailToken(
			verifyEmailToken,
			async (decoded: JwtPayload): Promise<void> => {
				const email: string = decoded.verifyEmail.email;

				const foundUser: User | null =
					await this.userPrismaService.getUserByEmail(email);

				if (!foundUser) {
					logger.alert({
						message: 'User not found when verifying email.',
						context: {
							email,
							verifyEmailToken,
						},
					});

					throw new CustomError(`MESSAGE TO WRITE.`, 401);
				}
				if (foundUser.emailVerifiedAt) {
					logger.warning({
						message: 'Email already verified.',
						context: {
							email,
						},
					});
					throw new CustomError(`Email already verified.`, 410);
				}
				await this.userPrismaService.updateUserByEmail(foundUser.email, {
					emailVerifiedAt: new Date(Date.now()),
				});
			},
		);
		return res.status(204).json({ message: 'Email verified.' });
	}

	async resendVerifyEmail(req: Request, res: Response): Promise<Response> {
		const { email } = req.body;

		const user: User | null =
			await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			throw new CustomError('User not found.', 404);
		}

		if (user.emailVerifiedAt) {
			throw new CustomError(`Email already verified.`, 409);
		}

		const verifyToken: string = this.jwtService.signVerifyEmailToken(
			user.email,
		);

		await this.mailerService.sendVerifyEmail(user, verifyToken);

		return res.status(204).json({ message: 'Verification email sent.' });
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

		const passwordsMatch: boolean = await this.bcryptService.compare(
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
			user.id,
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
					const email: string = decoded.email;
					const foundUser: User | null =
						await this.userPrismaService.getUserByEmail(email);
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
				const email: string = decoded.email;
				const roles: Role[] = userToken.user.roles;
				const accessToken: string = this.jwtService.signAccessToken(
					userToken.userId,
					email,
					roles,
				);

				const newRefreshToken: string = this.jwtService.signRefreshToken(email);

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

	async sendResetPasswordEmail(req: Request, res: Response): Promise<Response> {
		const { email } = req.body;

		const user: User | null =
			await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			return res.status(204).json({ message: 'Reset password email sent.' });
		}

		const resetPasswordToken: string = this.jwtService.signResetPasswordToken(
			user.email,
		);

		await this.resetPasswordTokenPrismaService.createOrUpdateResetPasswordToken(
			resetPasswordToken,
			user.id,
		);

		await this.mailerService.sendResetPasswordEmail(user, resetPasswordToken);
		return res.status(204).json({ message: 'Reset password email sent.' });
	}

	async resetPassword(req: Request, res: Response): Promise<Response> {
		const { resetPasswordToken } = req.params;

		this.jwtService.verifyResetPasswordToken(
			resetPasswordToken,
			async (decoded: JwtPayload): Promise<void> => {
				const email: string = decoded.resetPassword.email;

				const tokenExists: ResetPasswordToken | null =
					await this.resetPasswordTokenPrismaService.getResetPasswordToken(
						resetPasswordToken,
					);

				if (!tokenExists) {
					throw new CustomError(`Token invalid.`, 401);
				}

				const foundUser: User | null =
					await this.userPrismaService.getUserByEmail(email);

				if (!foundUser) {
					logger.warning({
						message: 'User not found.',
						context: {
							email,
						},
					});

					throw new CustomError('User not found.', 401);
				}

				const hashedPassword: string = await this.bcryptService.hash(
					req.body.password,
				);

				await this.userPrismaService.updateUserByEmail(email, {
					password: hashedPassword,
				});

				await this.resetPasswordTokenPrismaService.deleteResetPasswordToken(
					resetPasswordToken,
				);
			},
		);
		return res.status(204).json({ message: 'Password has been updated.' });
	}

	async logout(req: Request, res: Response): Promise<Response> {
		const { jwt } = req.cookies;

		try {
			await this.userTokenPrismaService.deleteUserToken(jwt);
		} catch (err) {
			if (!(err instanceof Prisma.PrismaClientUnknownRequestError)) {
				throw err;
			}
		}

		res.clearCookie('jwt', { httpOnly: true, secure: false, sameSite: 'lax' });
		return res.status(204).json({ message: 'Success' });
	}
}
