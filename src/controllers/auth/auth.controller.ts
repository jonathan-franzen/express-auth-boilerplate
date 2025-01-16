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
import { UserToken } from '@prisma/client';
import { Request, Response } from 'express';
import { EventManager } from 'serverless-sqs-events';

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

		const duplicate = await this.userPrismaService.getUserByEmail(email, {
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

		const hashedPassword = await this.bcryptService.hash(password);

		const createdUser = await this.userPrismaService.createUser({
			email,
			password: hashedPassword,
			firstName,
			lastName,
		});

		const verifyToken = this.jwtService.signVerifyEmailToken(createdUser.email);

		const emailOptions = await this.mailerService.getVerifyEmailOptions(createdUser, verifyToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(201).json({
			message: 'User successfully created.',
			email: createdUser.email,
		});
	}

	async verifyEmail(req: Request, res: Response): Promise<Response> {
		const { verifyEmailToken } = req.params;

		const decodedVerifyEmailToken = await this.jwtService.verifyVerifyEmailToken(verifyEmailToken);

		if (decodedVerifyEmailToken.alreadyVerified) {
			return res.status(200).json({ message: 'Email already verified.' });
		}

		const email = decodedVerifyEmailToken.verifyEmail.email;

		const foundUser = await this.userPrismaService.getUserByEmail(email, {
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

		const user = await this.userPrismaService.getUserByEmail(email, {
			password: true,
			roles: true,
		});

		if (!user) {
			return res.status(200).json({ message: 'Email successfully sent.' });
		}

		if (user.emailVerifiedAt) {
			return res.status(200).json({ message: 'Email already verified.' });
		}

		const verifyToken = this.jwtService.signVerifyEmailToken(user.email);

		const emailOptions = await this.mailerService.getVerifyEmailOptions(user, verifyToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(200).json({ message: 'Email successfully sent.' });
	}

	async login(req: Request, res: Response): Promise<Response> {
		const { email, password } = req.body;
		const { refreshToken } = req.cookies;

		const user = await this.userPrismaService.getUserByEmail(email);

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
			const deleteRefreshToken = await until((): Promise<UserToken> => this.userTokenPrismaService.deleteUserToken(refreshToken));

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

		const accessToken = this.jwtService.signAccessToken(user.id, user.email);
		const newRefreshToken = this.jwtService.signRefreshToken(user.email);

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

		const userToken = await this.userTokenPrismaService.getUserTokenByToken(refreshToken, {
			user: true,
		});

		if (!userToken) {
			const decodedRefreshToken = await this.jwtService.verifyRefreshToken(refreshToken, false);
			const email = decodedRefreshToken.email;
			const foundUser = await this.userPrismaService.getUserByEmail(email, {
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

		const decodedRefreshToken = await this.jwtService.verifyRefreshToken(refreshToken, true);

		const deleteRefreshToken = await until((): Promise<UserToken> => this.userTokenPrismaService.deleteUserToken(refreshToken));

		if (deleteRefreshToken.error) {
			if (!this.userTokenPrismaService.recordNotExistError(deleteRefreshToken.error)) {
				logger.alert({ message: 'Failed to delete invalid refresh token.', context: { error: deleteRefreshToken.error } });
				res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'none' });

				throw this.httpErrorService.internalServerError();
			}
		}

		const email = decodedRefreshToken.email;

		const accessToken = this.jwtService.signAccessToken(userToken.userId, email);
		const newRefreshToken = this.jwtService.signRefreshToken(email);

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

		const user = await this.userPrismaService.getUserByEmail(email, {
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

		const decodedResetPasswordToken = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email = decodedResetPasswordToken.resetPassword.email;
		const tokenExists = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			throw this.httpErrorService.tokenExpiredError();
		}

		const foundUser = await this.userPrismaService.getUserByEmail(email, {
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
		const { newPassword } = req.body;

		const decodedResetPasswordToken = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email = decodedResetPasswordToken.resetPassword.email;
		const tokenExists = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			throw this.httpErrorService.tokenExpiredError();
		}

		const foundUser = await this.userPrismaService.getUserByEmail(email, {
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

		const hashedPassword = await this.bcryptService.hash(newPassword);

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

		const deleteRefreshToken = await until((): Promise<UserToken> => this.userTokenPrismaService.deleteUserToken(refreshToken));

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
