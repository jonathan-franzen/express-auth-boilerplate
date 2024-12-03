import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { StatusCodeError } from '@/errors/status-code.error.js';
import { ResetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/reset-password-token.prisma.service.js';
import { UserTokenPrismaService } from '@/services/prisma/user-token/user-token.prisma.service.js';
import logger from '@/utils/logger.js';
import { Prisma, Role } from '@prisma/client';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

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
			{ expiresIn: '10s' },
		);
	}

	signRefreshToken(email: string): string {
		return jwt.sign({ email }, REFRESH_TOKEN_SECRET, {
			expiresIn: '2m',
		});
	}

	verifyRefreshToken(token: string, deleteTokenOnError: boolean, callback: (decoded: JwtPayload) => Promise<string | void>): string | void {
		return jwt.verify(token, REFRESH_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
			if (err || typeof decoded !== 'object' || !decoded.email) {
				logger.warning({
					message: 'Token expired, or not valid.',
				});

				if (deleteTokenOnError) {
					try {
						await this.userTokenPrismaService.deleteUserToken(token);
					} catch (err) {
						if (!(err instanceof Prisma.PrismaClientUnknownRequestError)) {
							throw err;
						}
					}
				}

				throw new StatusCodeError('Token expired, or not valid.', 403);
			}
			await callback(decoded);
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

	verifyVerifyEmailToken(token: string, callback: (decoded: JwtPayload) => Promise<string | void>): string | void {
		return jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
			if (err || typeof decoded !== 'object' || !decoded.verifyEmail.email) {
				logger.warning({
					message: 'Verify email token expired, or not valid.',
				});

				throw new StatusCodeError('Verify email token expired, or not valid.', 401);
			}

			await callback(decoded);
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

	verifyResetPasswordToken(token: string, callback: (decoded: JwtPayload) => Promise<string | void>): string | void {
		return jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): Promise<void> => {
			if (err || typeof decoded !== 'object' || !decoded.resetPassword.email) {
				logger.warning({
					message: 'Reset password token expired, or not valid.',
				});

				try {
					await this.resetPasswordTokenPrismaService.deleteResetPasswordToken(token);
				} catch (err) {
					if (!(err instanceof Prisma.PrismaClientUnknownRequestError)) {
						throw err;
					}
				}

				throw new StatusCodeError('Reset password token expired, or not valid.', 401);
			}

			await callback(decoded);
		});
	}
}
