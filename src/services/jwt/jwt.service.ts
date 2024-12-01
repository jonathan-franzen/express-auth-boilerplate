import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import {
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
} from '@/constants/environment.constants.js';
import { Prisma, Role } from '@prisma/client';
import logger from '@/utils/logger.js';
import { CustomError } from '@/utils/custom-error.js';
import { UserTokenPrismaService } from '@/services/prisma/user-token/user-token.prisma.service.js';

export class JwtService {
	constructor(
		private readonly userTokenPrismaService: UserTokenPrismaService,
	) {}

	signAccessToken(email: string, roles: Role[]): string {
		return jwt.sign(
			{
				userInfo: {
					email: email,
					roles: roles,
				},
			},
			ACCESS_TOKEN_SECRET,
			{ expiresIn: '10s' },
		);
	}

	signRefreshToken(email: string): string {
		return jwt.sign({ email: email }, REFRESH_TOKEN_SECRET, {
			expiresIn: '2m',
		});
	}

	verifyRefreshToken(
		token: string,
		deleteTokenOnError: boolean,
		callback: (decoded: JwtPayload) => Promise<string | void>,
	): string | void {
		return jwt.verify(
			token,
			REFRESH_TOKEN_SECRET,
			async (
				err: VerifyErrors | null,
				decoded: JwtPayload | string | undefined,
			): Promise<void> => {
				if (err || typeof decoded !== 'object') {
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

					throw new CustomError('Token expired, or not valid.', 403);
				}
				await callback(decoded);
			},
		);
	}
}
