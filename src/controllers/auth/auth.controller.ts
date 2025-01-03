import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import EventsInterface from '@/interfaces/events/events.interface.js';
import BcryptService from '@/services/bcrypt/bcrypt.service.js';
import HttpErrorService from '@/services/http-error/http-error.service.js';
import JwtService from '@/services/jwt/jwt.service.js';
import MailerService from '@/services/mailer/mailer.service.js';
import ResetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import UserTokenPrismaService from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Prisma, ResetPasswordToken, User } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { EventManager } from 'serverless-sqs-events';

import UserTokenInclude = Prisma.UserTokenInclude;
import UserTokenGetPayload = Prisma.UserTokenGetPayload;
import UserGetPayload = Prisma.UserGetPayload;

class AuthController {
	constructor(
		private readonly httpErrorService: HttpErrorService,
		private readonly eventManager: EventManager<EventsInterface>,
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

			throw this.httpErrorService.emailAlreadyInUseError();
		}

		const hashedPassword: string = await this.bcryptService.hash(password);

		const createdUser: User = await this.userPrismaService.createUser({
			email,
			password: hashedPassword,
			firstName,
			lastName,
		});

		const verifyToken: string = this.jwtService.signVerifyEmailToken(createdUser.email);

		const emailOptions = await this.mailerService.getVerifyEmailOptions(createdUser, verifyToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(201).json({
			message: 'User successfully created.',
			email: createdUser.email,
		});
	}

	async verifyEmail(req: Request, res: Response): Promise<Response> {
		const { verifyEmailToken } = req.params;

		const decodedVerifyEmailToken: JwtPayload = await this.jwtService.verifyVerifyEmailToken(verifyEmailToken);

		if (decodedVerifyEmailToken.alreadyVerified) {
			return res.status(200).json({ message: 'Email already verified.' });
		}

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

			throw this.httpErrorService.tokenInvalidError();
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

		const emailOptions = await this.mailerService.getVerifyEmailOptions(user, verifyToken);

		await this.eventManager.send('sendEmail', emailOptions);

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

			// Bcrypt to make sure response time is consistent.
			await this.bcryptService.compare(password, 'random');
			throw this.httpErrorService.invalidCredentialsError();
		}

		const passwordsMatch: boolean = await this.bcryptService.compare(password, user.password);

		if (!passwordsMatch) {
			logger.warning({
				message: 'Incorrect password.',
				context: {
					email,
				},
			});

			throw this.httpErrorService.invalidCredentialsError();
		}

		if (refreshToken) {
			const deleteRefreshToken = await until(() => this.userTokenPrismaService.deleteUserToken(refreshToken));

			if (deleteRefreshToken.error) {
				if (this.userTokenPrismaService.recordNotExistError(deleteRefreshToken.error)) {
					logger.alert({
						message: 'Attempted refresh token reuse at login.',
						context: {
							email,
						},
					});

					await this.userTokenPrismaService.deleteUserTokens({ userId: user.id });
				} else {
					logger.error({ message: 'Failed to delete refresh token.', context: { error: deleteRefreshToken.error } });

					throw this.httpErrorService.internalServerError();
				}
			}
		}

		const accessToken: string = this.jwtService.signAccessToken(user.id, user.email);
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

			throw this.httpErrorService.tokenInvalidError();
		}

		const decodedRefreshToken: JwtPayload = await this.jwtService.verifyRefreshToken(refreshToken, true);

		const deleteRefreshToken = await until(() => this.userTokenPrismaService.deleteUserToken(refreshToken));

		if (deleteRefreshToken.error) {
			if (!this.userTokenPrismaService.recordNotExistError(deleteRefreshToken.error)) {
				logger.alert({ message: 'Failed to delete invalid refresh token.', context: { error: deleteRefreshToken.error } });
				res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });

				throw this.httpErrorService.internalServerError();
			}
		}

		const email: string = decodedRefreshToken.email;

		const accessToken: string = this.jwtService.signAccessToken(userToken.userId, email);
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

		const emailOptions = await this.mailerService.getResetPasswordEmailOptions(user, resetPasswordToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(200).json({ message: 'Email successfully sent.' });
	}

	async verifyResetPasswordToken(req: Request, res: Response): Promise<Response> {
		const { resetPasswordToken } = req.params;

		const decodedResetPasswordToken: JwtPayload = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email: string = decodedResetPasswordToken.resetPassword.email;
		const tokenExists: ResetPasswordToken | null = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			throw this.httpErrorService.tokenExpiredError();
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

			throw this.httpErrorService.tokenInvalidError();
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
			throw this.httpErrorService.tokenExpiredError();
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

			throw this.httpErrorService.tokenInvalidError();
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

		const deleteRefreshToken = await until(() => this.userTokenPrismaService.deleteUserToken(refreshToken));

		if (deleteRefreshToken.error) {
			if (!this.userTokenPrismaService.recordNotExistError(deleteRefreshToken.error)) {
				logger.alert({ message: 'Failed to delete invalid refresh token.', context: { error: deleteRefreshToken.error } });
				res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });

				return res.sendStatus(204);
			}
		}

		res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });
		return res.sendStatus(204);
	}
}

export default AuthController;
