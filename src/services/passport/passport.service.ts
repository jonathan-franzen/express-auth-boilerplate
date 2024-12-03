import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { UserPrismaService } from '@/services/prisma/user/user.prisma.service.js';
import { Prisma } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import passport, { PassportStatic } from 'passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import UserGetPayload = Prisma.UserGetPayload;

export class PassportService {
	constructor(private readonly userPrismaService: UserPrismaService) {
		passport.use(
			new Strategy(
				{
					jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
					secretOrKey: ACCESS_TOKEN_SECRET,
				},
				this.verifyCallback.bind(this),
			),
		);
	}

	private async verifyCallback(jwt_payload: JwtPayload, done: VerifiedCallback): Promise<void> {
		const email: string | undefined = jwt_payload?.userInfo?.email;

		if (!email) {
			return done(null, false);
		}

		try {
			const user: UserGetPayload<{ omit: { password: true } }> | null = await this.userPrismaService.getUserByEmail(email, { password: true });

			if (!user) {
				return done(null, false);
			}

			return done(null, user);
		} catch (error) {
			return done(error, false);
		}
	}

	getPassportInstance(): PassportStatic {
		return passport;
	}
}
