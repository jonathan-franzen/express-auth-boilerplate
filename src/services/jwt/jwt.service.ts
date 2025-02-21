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
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

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
					email,
					id,
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

	verifyRefreshToken(token: string, deleteTokenOnError: boolean): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, REFRESH_TOKEN_SECRET, async (err: null | VerifyErrors, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || typeof decoded !== 'object' || !decoded.email) {
					if (deleteTokenOnError) {
						const { error } = await until(() => this.userTokenPrismaService.deleteUserToken(token));
						if (error && !this.userTokenPrismaService.recordNotExistError(error)) {
							logger.alert({ context: err, message: 'Failed to delete invalid refresh token.' });

							return reject(this.httpErrorService.internalServerError());
						}
					}

					logger.warning({
						context: {
							decoded,
							err,
						},
						message: 'Refresh token expired, or not valid.',
					});

					return reject(this.httpErrorService.tokenInvalidError());
				}

				return resolve(decoded);
			});
		});
	}

	async verifyResetPasswordToken(token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: null | VerifyErrors, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || !decoded || typeof decoded !== 'object' || !decoded.resetPassword?.email) {
					const { error } = await until(() => this.resetPasswordTokenPrismaService.deleteResetPasswordToken(token));

					if (error && !this.resetPasswordTokenPrismaService.recordNotExistError(error)) {
						logger.alert({ context: { error: err }, message: 'Failed to delete invalid reset password token.' });

						return reject(this.httpErrorService.internalServerError());
					}

					if (err instanceof jwt.TokenExpiredError) {
						logger.info({
							context: { token },
							message: 'Reset password token expired.',
						});

						return reject(this.httpErrorService.tokenExpiredError());
					} else {
						logger.warning({
							context: { token },
							message: 'Reset password token not valid, or error occurred.',
						});

						return reject(this.httpErrorService.tokenInvalidError());
					}
				}

				return resolve(decoded);
			});
		});
	}

	async verifyVerifyEmailToken(token: string): Promise<JwtPayload> {
		return new Promise((resolve: JwtVerifyResolveJwtInterface, reject: JwtVerifyRejectJwtInterface): void => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: null | VerifyErrors, decoded: JwtPayload | string | undefined): Promise<void> => {
				if (err || typeof decoded !== 'object' || !decoded.verifyEmail.email) {
					logger.warning({
						context: {
							decoded,
							err,
						},
						message: 'Verify email token expired, or not valid.',
					});

					if (err instanceof jwt.TokenExpiredError) {
						const decodedNew = jwt.decode(token);

						if (typeof decodedNew !== 'object' || !decodedNew || !decodedNew.verifyEmail.email) {
							return reject(this.httpErrorService.tokenExpiredError());
						}

						const email = decodedNew.verifyEmail.email;
						const foundUser = await this.userPrismaService.getUserByEmail(email);

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
}

export default JwtService;
