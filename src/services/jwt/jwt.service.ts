import { ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME, RESET_PASSWORD_TOKEN_LIFETIME, VERIFY_EMAIL_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/constants/environment.constants.js';
import JwtVerifyRejectJwtInterface from '@/interfaces/jwt/jwt-verify-reject.jwt.interface.js';
import JwtVerifyResolveJwtInterface from '@/interfaces/jwt/jwt-verify-resolve.jwt.interface.js';
import HttpErrorService from '@/services/http-error/http-error.service.js';
import ResetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import UserTokenPrismaService from '@/services/prisma/user-token/user-token.prisma.service.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import logger from '@/utils/logger.js';
import { until } from '@open-draft/until';
import { Prisma } from '@prisma/client';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

import UserGetPayload = Prisma.UserGetPayload;

class JwtService {
	constructor(
		private readonly userPrismaService: UserPrismaService,
		private readonly userTokenPrismaService: UserTokenPrismaService,
		private readonly resetPasswordTokenPrismaService: ResetPasswordTokenPrismaService,
		private readonly httpErrorService: HttpErrorService,
	) {}

	signAccessToken(id: string, email: string): string {
		return jwt.sign(
			{
				userInfo: {
					id,
					email,
				},
			},
			ACCESS_TOKEN_SECRET,
			{ expiresIn: ACCESS_TOKEN_LIFETIME },
		);
	}

	signRefreshToken(email: string): string {
		return jwt.sign({ email }, REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_LIFETIME,
		});
	}

	verifyRefreshToken(token: string, deleteTokenOnError: boolean): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, REFRESH_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || typeof decoded !== 'object' || !decoded.email) {
					if (deleteTokenOnError) {
						const deleteRefreshToken = await until(() => this.userTokenPrismaService.deleteUserToken(token));
						if (deleteRefreshToken.error && !this.userTokenPrismaService.recordNotExistError(deleteRefreshToken.error)) {
							logger.alert({ message: 'Failed to delete invalid refresh token.', context: err });

							return reject(this.httpErrorService.internalServerError());
						}
					}

					logger.warning({
						message: 'Refresh token expired, or not valid.',
						context: {
							decoded,
							err,
						},
					});

					return reject(this.httpErrorService.tokenInvalidError());
				}

				return resolve(decoded);
			});
		});
	}

	signVerifyEmailToken(email: string): string {
		return jwt.sign(
			{
				verifyEmail: {
					email: email,
				},
			},
			ACCESS_TOKEN_SECRET,
			{ expiresIn: VERIFY_EMAIL_TOKEN_LIFETIME },
		);
	}

	async verifyVerifyEmailToken(token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || typeof decoded !== 'object' || !decoded.verifyEmail.email) {
					logger.warning({
						message: 'Verify email token expired, or not valid.',
						context: {
							decoded,
							err,
						},
					});

					if (err instanceof jwt.TokenExpiredError) {
						const decodedNew: JwtPayload | string | null = jwt.decode(token);

						if (typeof decodedNew !== 'object' || !decodedNew || !decodedNew.verifyEmail.email) {
							return reject(this.httpErrorService.tokenExpiredError());
						}

						const email: string = decodedNew.verifyEmail.email;
						const foundUser: UserGetPayload<{ omit: { password: true; roles: true } }> | null = await this.userPrismaService.getUserByEmail(email, {
							password: true,
							roles: true,
						});

						if (foundUser && foundUser.emailVerifiedAt) {
							return resolve({ alreadyVerified: true });
						}

						return reject(this.httpErrorService.tokenExpiredError());
					} else {
						return reject(this.httpErrorService.tokenInvalidError());
					}
				}
				return resolve(decoded);
			});
		});
	}

	signResetPasswordToken(email: string): string {
		return jwt.sign(
			{
				resetPassword: {
					email: email,
				},
			},
			ACCESS_TOKEN_SECRET,
			{ expiresIn: RESET_PASSWORD_TOKEN_LIFETIME },
		);
	}

	async verifyResetPasswordToken(token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || !decoded || typeof decoded !== 'object' || !decoded.resetPassword?.email) {
					const deleteResetPasswordToken = await until(() => this.resetPasswordTokenPrismaService.deleteResetPasswordToken(token));

					if (deleteResetPasswordToken.error && !this.resetPasswordTokenPrismaService.recordNotExistError(deleteResetPasswordToken.error)) {
						logger.alert({ message: 'Failed to delete invalid reset password token.', context: { error: err } });

						return reject(this.httpErrorService.internalServerError());
					}

					if (err instanceof jwt.TokenExpiredError) {
						logger.info({
							message: 'Reset password token expired.',
							context: { token },
						});

						return reject(this.httpErrorService.tokenExpiredError());
					} else {
						logger.warning({
							message: 'Reset password token not valid, or error occurred.',
							context: { token },
						});

						return reject(this.httpErrorService.tokenInvalidError());
					}
				}

				return resolve(decoded);
			});
		});
	}
}

export default JwtService;
