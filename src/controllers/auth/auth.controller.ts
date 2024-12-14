import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import BcryptService from '@/services/bcrypt/bcrypt.service.js';
import JwtService from '@/services/jwt/jwt.service.js';
import MailerService from '@/services/mailer/mailer.service.js';
import ResetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import UserTokenPrismaService from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { Prisma, ResetPasswordToken, Role, User } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import UserTokenInclude = Prisma.UserTokenInclude;
import UserTokenGetPayload = Prisma.UserTokenGetPayload;
import UserGetPayload = Prisma.UserGetPayload;

export default class AuthController {
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

		const duplicate: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (duplicate) {
			logger.warning({
				message: 'User not created. Email already in use.',
				context: {
					email,
				},
			});

			return res.status(409).json({ error: 'Email already in use.' });
		}

		const hashedPassword: string = await this.bcryptService.hash(password);

		const createdUser: User = await this.userPrismaService.createUser({
			email,
			password: hashedPassword,
			firstName,
			lastName,
		});

		const verifyToken: string = this.jwtService.signVerifyEmailToken(createdUser.email);

		await this.mailerService.sendVerifyEmail(createdUser, verifyToken);

		return res.status(201).json({
			message: 'User successfully created.',
			email: createdUser.email,
		});
	}

	async verifyEmail(req: Request, res: Response): Promise<Response> {
		const { verifyEmailToken } = req.params;

		const decodedVerifyEmailToken: JwtPayload = await this.jwtService.verifyVerifyEmailToken(verifyEmailToken);
		const email: string = decodedVerifyEmailToken.verifyEmail.email;

		const foundUser: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (!foundUser) {
			logger.alert({
				message: 'User not found when verifying email.',
				context: {
					email,
					verifyEmailToken,
				},
			});

			return res.status(401).json({ error: 'Token invalid.' });
		}

		if (foundUser.emailVerifiedAt) {
			logger.warning({
				message: 'Email already verified.',
				context: {
					email,
				},
			});

			return res.status(200).json({ message: 'Email already verified.' });
		}

		await this.userPrismaService.updateUser(
			{ email: foundUser.email },
			{
				emailVerifiedAt: new Date(Date.now()),
			},
		);

		return res.status(200).json({ message: 'Email successfully verified.' });
	}

	async resendVerifyEmail(req: Request, res: Response): Promise<Response> {
		const { email } = req.body;

		const user: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (!user) {
			return res.status(200).json({ message: 'Email successfully sent.' });
		}

		if (user.emailVerifiedAt) {
			return res.status(200).json({ message: 'Email already verified.' });
		}

		const verifyToken: string = this.jwtService.signVerifyEmailToken(user.email);

		await this.mailerService.sendVerifyEmail(user, verifyToken);

		return res.status(200).json({ message: 'Email successfully sent.' });
	}

	async login(req: Request, res: Response): Promise<Response> {
		const { email, password } = req.body;
		const { refreshToken } = req.cookies;

		const user: User | null = await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			logger.warning({
				message: 'Attempted login where user does not exist.',
				context: {
					email,
				},
			});

			return res.status(401).json({ error: 'Invalid credentials.' });
		}

		const passwordsMatch: boolean = await this.bcryptService.compare(password, user.password);

		if (!passwordsMatch) {
			logger.warning({
				message: 'Incorrect password.',
				context: {
					email,
				},
			});

			return res.status(401).json({ error: 'Invalid credentials.' });
		}

		if (refreshToken) {
			try {
				await this.userTokenPrismaService.deleteUserToken(refreshToken);
			} catch (err) {
				if (this.userTokenPrismaService.recordNotExistError(err)) {
					logger.alert({
						message: 'Attempted refresh token reuse at login.',
						context: {
							email,
						},
					});

					await this.userTokenPrismaService.deleteUserTokens({ userId: user.id });
				} else {
					logger.error({ message: 'Failed to delete refresh token.', context: { error: err } });

					return res.status(500).json({ error: 'Internal server error.' });
				}
			}
		}

		const accessToken: string = this.jwtService.signAccessToken(user.id, user.email, user.roles);
		const newRefreshToken: string = this.jwtService.signRefreshToken(user.email);

		await this.userTokenPrismaService.createUserToken({
			token: newRefreshToken,
			userId: user.id,
		});

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: process.env.APP_ENV === 'prod',
			sameSite: 'none',
			maxAge: REFRESH_TOKEN_LIFETIME * 1000,
		});

		return res.status(200).json({ message: 'Login successful.', accessToken });
	}

	async refresh(req: Request, res: Response): Promise<Response> {
		const { refreshToken } = req.cookies;

		const userToken: UserTokenGetPayload<{ include: UserTokenInclude }> | null = await this.userTokenPrismaService.getUserTokenByToken(refreshToken, {
			user: true,
		});

		if (!userToken) {
			const decodedRefreshToken: JwtPayload = await this.jwtService.verifyRefreshToken(refreshToken, false);
			const email: string = decodedRefreshToken.email;
			const foundUser: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
				password: true,
				roles: true,
			});

			if (foundUser) {
				await this.userTokenPrismaService.deleteUserTokens({ userId: foundUser.id });

				logger.alert({
					message: 'Attempted reuse of refresh token mitigated.',
					context: {
						email: foundUser.email,
					},
				});
			}

			res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });

			return res.status(401).json({ error: 'Token invalid.' });
		}

		const decodedRefreshToken: JwtPayload = await this.jwtService.verifyRefreshToken(refreshToken, true);

		try {
			await this.userTokenPrismaService.deleteUserToken(refreshToken);
		} catch (err) {
			if (!this.userTokenPrismaService.recordNotExistError(err)) {
				res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });

				return res.status(500).json({ error: 'Internal server error.' });
			}
		}

		const email: string = decodedRefreshToken.email;
		const roles: Role[] = userToken.user.roles;

		const accessToken: string = this.jwtService.signAccessToken(userToken.userId, email, roles);
		const newRefreshToken: string = this.jwtService.signRefreshToken(email);

		await this.userTokenPrismaService.createUserToken({
			userId: userToken.userId,
			token: newRefreshToken,
		});

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: process.env.APP_ENV === 'prod',
			sameSite: 'none',
			maxAge: REFRESH_TOKEN_LIFETIME * 1000,
		});

		return res.status(200).json({ message: 'Refresh successful.', accessToken });
	}

	async sendResetPasswordEmail(req: Request, res: Response): Promise<Response> {
		const { email } = req.body;

		const user: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (!user) {
			return res.status(200).json({ message: 'Email successfully sent.' });
		}

		const resetPasswordToken: string = this.jwtService.signResetPasswordToken(user.email);

		await this.resetPasswordTokenPrismaService.createOrUpdateResetPasswordToken(resetPasswordToken, user.id);

		await this.mailerService.sendResetPasswordEmail(user, resetPasswordToken);
		return res.status(200).json({ message: 'Email successfully sent.' });
	}

	async verifyResetPasswordToken(req: Request, res: Response): Promise<Response> {
		const { resetPasswordToken } = req.params;

		const decodedResetPasswordToken: JwtPayload = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email: string = decodedResetPasswordToken.resetPassword.email;
		const tokenExists: ResetPasswordToken | null = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			return res.status(410).json({ error: 'Token expired.' });
		}

		const foundUser: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (!foundUser) {
			logger.error({
				message: 'User not found when verifying reset password token.',
				context: {
					email,
				},
			});

			return res.status(401).json({ error: 'Token invalid.' });
		}

		return res.status(200).json({ message: 'Token is valid.' });
	}

	async resetPassword(req: Request, res: Response): Promise<Response> {
		const { resetPasswordToken } = req.params;
		const { password } = req.body;

		const decodedResetPasswordToken: JwtPayload = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email: string = decodedResetPasswordToken.resetPassword.email;
		const tokenExists: ResetPasswordToken | null = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			return res.status(410).json({ error: 'Token expired.' });
		}

		const foundUser: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (!foundUser) {
			logger.error({
				message: 'User not found when resetting password.',
				context: {
					email,
				},
			});

			return res.status(401).json({ error: 'Token invalid.' });
		}

		const hashedPassword: string = await this.bcryptService.hash(password);

		await this.userPrismaService.updateUser(
			{ email },
			{
				password: hashedPassword,
			},
		);

		await this.resetPasswordTokenPrismaService.deleteResetPasswordToken(resetPasswordToken);

		return res.status(200).json({ message: 'Password successfully updated.' });
	}

	async logout(req: Request, res: Response): Promise<Response> {
		const { refreshToken } = req.cookies;

		try {
			await this.userTokenPrismaService.deleteUserToken(refreshToken);
		} catch (err) {
			if (!this.userTokenPrismaService.recordNotExistError(err)) {
				logger.alert({ message: 'Failed to delete invalid refresh token.', context: { error: err } });

				return res.status(500).json({ error: 'Internal server error.' });
			}
		}

		res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });
		return res.sendStatus(204);
	}
}
