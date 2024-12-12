import { ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME, RESET_PASSWORD_TOKEN_LIFETIME, VERIFY_EMAIL_TOKEN_LIFETIME } from '@/constants/auth.constants.js';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { JwtVerifyRejectJwtInterface } from '@/interfaces/jwt/jwt-verify-reject.jwt.interface.js';
import { JwtVerifyResolveJwtInterface } from '@/interfaces/jwt/jwt-verify-resolve.jwt.interface.js';
import { ResetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import { UserTokenPrismaService } from '@/services/prisma/user-token/user-token.prisma.service.js';
import logger from '@/utils/logger.js';
import { Prisma, Role } from '@prisma/client';
import { Response } from 'express';
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
			{ expiresIn: ACCESS_TOKEN_LIFETIME },
		);
	}

	signRefreshToken(email: string): string {
		return jwt.sign({ email }, REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_LIFETIME,
		});
	}

	verifyRefreshToken(res: Response, token: string, deleteTokenOnError: boolean): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, REFRESH_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || typeof decoded !== 'object' || !decoded.email) {
					if (deleteTokenOnError) {
						try {
							await this.userTokenPrismaService.deleteUserToken(token);
						} catch (err) {
							if (!(err instanceof PrismaClientUnknownRequestError)) {
								logger.alert({ message: 'Failed to delete invalid refresh token.', context: err });

								return reject(res.status(500).json({ error: 'Internal server error.' }));
							}
						}
					}

					logger.warning({
						message: 'Refresh token expired, or not valid.',
						context: {
							decoded,
							err,
						},
					});

					return reject(res.status(401).json({ error: 'Token invalid.' }));
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

	async verifyVerifyEmailToken(res: Response, token: string): Promise<JwtPayload> {
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

					return reject(res.status(401).json({ error: 'Token invalid.' }));
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

	async verifyResetPasswordToken(res: Response, token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || !decoded || typeof decoded !== 'object' || !decoded.resetPassword?.email) {
					try {
						await this.resetPasswordTokenPrismaService.deleteResetPasswordToken(token);
					} catch (err) {
						if (!(err instanceof PrismaClientUnknownRequestError)) {
							logger.alert({ message: 'Failed to delete invalid reset password token.', context: { error: err } });

							return reject(res.status(500).json({ error: 'Internal server error.' }));
						}
					}

					if (err instanceof jwt.TokenExpiredError) {
						logger.info({
							message: 'Reset password token expired.',
							context: { token },
						});

						return reject(res.status(410).json({ error: 'Token expired.' }));
					} else {
						logger.warning({
							message: 'Reset password token not valid, or error occurred.',
							context: { token },
						});

						return reject(res.status(401).json({ error: 'Token invalid.' }));
					}
				}

				return resolve(decoded);
			});
		});
	}
}
