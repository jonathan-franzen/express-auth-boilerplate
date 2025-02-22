import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { EventsInterface } from '@/interfaces/events/events.interfaces.js';
import BcryptService from '@/services/bcrypt/bcrypt.service.js';
import HttpErrorService from '@/services/http-error/http-error.service.js';
import JwtService from '@/services/jwt/jwt.service.js';
import MailerService from '@/services/mailer/mailer.service.js';
import ResetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import UserTokenPrismaService from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
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

	async deleteLogout(req: Request, res: Response): Promise<Response> {
		const { refreshToken } = req.cookies as Record<string, string>;

		const { error } = await until(() => this.userTokenPrismaService.deleteUserToken(refreshToken));

		if (error && !this.userTokenPrismaService.recordNotExistError(error)) {
			logger.alert({ context: { error }, message: 'Failed to delete refresh token.' });
		}

		res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: false });
		return res.sendStatus(204);
	}

	async getResetPasswordTokenValid(req: Request, res: Response): Promise<Response> {
		const { resetPasswordToken } = req.params;

		const decodedResetPasswordToken = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email = decodedResetPasswordToken.resetPassword.email;
		const tokenExists = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			throw this.httpErrorService.tokenExpiredError();
		}

		const foundUser = await this.userPrismaService.getUserByEmail(email);

		if (!foundUser) {
			logger.error({
				context: {
					email,
				},
				message: 'User not found when verifying reset password token.',
			});

			throw this.httpErrorService.tokenInvalidError();
		}

		return res.status(200).json({ message: 'Token is valid.' });
	}

	async postLogin(req: Request, res: Response): Promise<Response> {
		const { email, password } = req.body as Record<string, string>;
		const { refreshToken } = req.cookies as Record<string, string>;

		const user = await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			logger.warning({
				context: {
					email,
				},
				message: 'Attempted login where user does not exist.',
			});

			// Bcrypt to make sure response time is consistent.
			await this.bcryptService.compare(password, 'random');
			throw this.httpErrorService.invalidCredentialsError();
		}

		const passwordsMatch = await user.validatePassword(password);

		if (!passwordsMatch) {
			logger.warning({
				context: {
					email,
				},
				message: 'Incorrect password.',
			});

			throw this.httpErrorService.invalidCredentialsError();
		}

		if (refreshToken) {
			const { error } = await until(() => this.userTokenPrismaService.deleteUserToken(refreshToken));

			if (error) {
				if (this.userTokenPrismaService.recordNotExistError(error)) {
					logger.alert({
						context: {
							email,
						},
						message: 'Attempted refresh token reuse at login.',
					});

					await this.userTokenPrismaService.deleteUserTokens({ userId: user.id });
				} else {
					logger.error({ context: { error }, message: 'Failed to delete refresh token.' });

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
			maxAge: REFRESH_TOKEN_LIFETIME * 1000,
			sameSite: 'none',
			secure: process.env.APP_ENV === 'prod',
		});

		return res.status(200).json({ accessToken, message: 'Login successful.' });
	}

	async postRefresh(req: Request, res: Response): Promise<Response> {
		const { refreshToken } = req.cookies as Record<string, string>;

		const userToken = await this.userTokenPrismaService.getUserTokenByToken(refreshToken);

		if (!userToken) {
			const decodedRefreshToken = await this.jwtService.verifyRefreshToken(refreshToken, false);
			const email = decodedRefreshToken.email;
			const foundUser = await this.userPrismaService.getUserByEmail(email);

			if (foundUser) {
				await this.userTokenPrismaService.deleteUserTokens({ userId: foundUser.id });

				logger.alert({
					context: {
						email: foundUser.email,
					},
					message: 'Attempted reuse of refresh token mitigated.',
				});
			}

			res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: false });

			throw this.httpErrorService.tokenInvalidError();
		}

		const decodedRefreshToken = await this.jwtService.verifyRefreshToken(refreshToken, true);

		const { error } = await until(() => this.userTokenPrismaService.deleteUserToken(refreshToken));

		if (error && !this.userTokenPrismaService.recordNotExistError(error)) {
			logger.alert({ context: { error }, message: 'Failed to delete invalid refresh token.' });
			res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: false });

			throw this.httpErrorService.internalServerError();
		}

		const email = decodedRefreshToken.email;

		const accessToken = this.jwtService.signAccessToken(userToken.userId, email);
		const newRefreshToken = this.jwtService.signRefreshToken(email);

		await this.userTokenPrismaService.createUserToken({
			token: newRefreshToken,
			userId: userToken.userId,
		});

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			maxAge: REFRESH_TOKEN_LIFETIME * 1000,
			sameSite: 'none',
			secure: process.env.APP_ENV === 'prod',
		});

		return res.status(200).json({ accessToken, message: 'Refresh successful.' });
	}

	async postRegister(req: Request, res: Response): Promise<Response> {
		const { email, firstName, lastName, password } = req.body as Record<string, string>;

		const duplicate = await this.userPrismaService.getUserByEmail(email);

		if (duplicate) {
			logger.warning({
				context: {
					email,
				},
				message: 'User not created. Email already in use.',
			});

			throw this.httpErrorService.emailAlreadyInUseError();
		}

		const createdUser = await this.userPrismaService.createUser({
			email,
			firstName,
			lastName,
			password,
		});

		const verifyToken = this.jwtService.signVerifyEmailToken(createdUser.email);

		const emailOptions = this.mailerService.getVerifyEmailOptions(createdUser, verifyToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(201).json({
			email: createdUser.email,
			message: 'User successfully created.',
		});
	}

	async postResendVerifyEmail(req: Request, res: Response): Promise<Response> {
		const { email } = req.body as Record<string, string>;

		const user = await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			return res.status(200).json({ message: 'Email successfully sent.' });
		}

		if (user.emailVerifiedAt) {
			return res.status(200).json({ message: 'Email already verified.' });
		}

		const verifyToken = this.jwtService.signVerifyEmailToken(user.email);

		const emailOptions = this.mailerService.getVerifyEmailOptions(user, verifyToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(200).json({ message: 'Email successfully sent.' });
	}

	async postResetPassword(req: Request, res: Response): Promise<Response> {
		const { resetPasswordToken } = req.params;
		const { newPassword } = req.body as Record<string, string>;

		const decodedResetPasswordToken = await this.jwtService.verifyResetPasswordToken(resetPasswordToken);
		const email = decodedResetPasswordToken.resetPassword.email;
		const tokenExists = await this.resetPasswordTokenPrismaService.getResetPasswordToken(resetPasswordToken);

		if (!tokenExists) {
			throw this.httpErrorService.tokenExpiredError();
		}

		const foundUser = await this.userPrismaService.getUserByEmail(email);

		if (!foundUser) {
			logger.error({
				context: {
					email,
				},
				message: 'User not found when resetting password.',
			});

			throw this.httpErrorService.tokenInvalidError();
		}

		await this.userPrismaService.updateUser(
			{ email },
			{
				password: newPassword,
			},
		);

		await this.resetPasswordTokenPrismaService.deleteResetPasswordToken(resetPasswordToken);

		return res.status(200).json({ message: 'Password successfully updated.' });
	}

	async postSendResetPasswordEmail(req: Request, res: Response): Promise<Response> {
		const { email } = req.body as Record<string, string>;

		const user = await this.userPrismaService.getUserByEmail(email);

		if (!user) {
			return res.status(200).json({ message: 'Email successfully sent.' });
		}

		const resetPasswordToken = this.jwtService.signResetPasswordToken(user.email);

		await this.resetPasswordTokenPrismaService.createOrUpdateResetPasswordToken(resetPasswordToken, user.id);

		const emailOptions = this.mailerService.getResetPasswordEmailOptions(user, resetPasswordToken);

		await this.eventManager.send('sendEmail', emailOptions);

		return res.status(200).json({ message: 'Email successfully sent.' });
	}

	async postVerifyEmail(req: Request, res: Response): Promise<Response> {
		const { verifyEmailToken } = req.params;

		const decodedVerifyEmailToken = await this.jwtService.verifyVerifyEmailToken(verifyEmailToken);

		if (decodedVerifyEmailToken.alreadyVerified) {
			return res.status(200).json({ message: 'Email already verified.' });
		}

		const email = decodedVerifyEmailToken.verifyEmail.email;

		const foundUser = await this.userPrismaService.getUserByEmail(email);

		if (!foundUser) {
			logger.alert({
				context: {
					email,
					verifyEmailToken,
				},
				message: 'User not found when verifying email.',
			});

			throw this.httpErrorService.tokenInvalidError();
		}

		if (foundUser.emailVerifiedAt) {
			logger.warning({
				context: {
					email,
				},
				message: 'Email already verified.',
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
}

export default AuthController;
