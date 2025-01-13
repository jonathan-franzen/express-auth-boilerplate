import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import { until } from '@open-draft/until';
import { User } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import passport, { PassportStatic } from 'passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

class PassportService {
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
		const id = jwt_payload?.userInfo?.id;

		if (!id) {
			return done(null, false);
		}

		const user = await until((): Promise<User | null> => this.userPrismaService.getUserById(id, { password: true }));

		if (user.error) {
			return done(user.error, false);
		} else if (!user.data) {
			return done(null, false);
		}

		return done(null, user.data);
	}

	getPassportInstance(): PassportStatic {
		return passport;
	}
}

export default PassportService;
