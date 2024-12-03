import { REFRESH_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { StatusCodeError } from '@/errors/status-code.error.js';
import { JwtVerifyRejectJwtInterface } from '@/interfaces/jwt/jwt-verify-reject.jwt.interface.js';
import { JwtVerifyResolveJwtInterface } from '@/interfaces/jwt/jwt-verify-resolve.jwt.interface.js';
import { ResetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import { UserTokenPrismaService } from '@/services/prisma/user-token/user-token.prisma.service.js';
import logger from '@/utils/logger.js';
import { Prisma, Role } from '@prisma/client';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

import PrismaClientUnknownRequestError = Prisma.PrismaClientUnknownRequestError;

export class JwtService {
	constructor(
		private readonly userTokenPrismaService: UserTokenPrismaService,
		private readonly resetPasswordTokenPrismaService: ResetPasswordTokenPrismaService,
	) {}

	signAccessToken(id: string, email: string, roles: Role[]): string {
		return jwt.sign(
			{
				userInfo: {
					id,
					email,
					roles,
				},
			},
			ACCESS_TOKEN_SECRET,
			{ expiresIn: '1h' },
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
					logger.warning({
						message: 'Refresh token expired, or not valid.',
					});

					if (deleteTokenOnError) {
						try {
							await this.userTokenPrismaService.deleteUserToken(token);
						} catch (err) {
							if (!(err instanceof PrismaClientUnknownRequestError)) {
								logger.error({ message: 'Failed to delete invalid refresh token.', context: err });

								return reject(err);
							}
						}
					}

					throw new StatusCodeError('Refresh token expired, or not valid.', 403);
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
			{ expiresIn: '1h' },
		);
	}

	async verifyVerifyEmailToken(token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || typeof decoded !== 'object' || !decoded.verifyEmail.email) {
					logger.warning({
						message: 'Verify email token expired, or not valid.',
					});

					return reject(new StatusCodeError('Verify email token expired, or not valid.', 401));
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
			{ expiresIn: '1h' },
		);
	}

	async verifyResetPasswordToken(token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || !decoded || typeof decoded !== 'object' || !decoded.resetPassword?.email) {
					logger.warning({
						message: 'Reset password token expired, or not valid.',
						context: { token },
					});

					try {
						await this.resetPasswordTokenPrismaService.deleteResetPasswordToken(token);
					} catch (err) {
						if (!(err instanceof PrismaClientUnknownRequestError)) {
							logger.error({ message: 'Failed to delete invalid reset password token.', context: err });

							return reject(err);
						}
					}

					return reject(new StatusCodeError('Reset password token expired, or not valid.', 401));
				}

				return resolve(decoded);
			});
		});
	}
}
