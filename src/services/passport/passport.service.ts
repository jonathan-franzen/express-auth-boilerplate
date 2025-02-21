import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
import { until } from '@open-draft/until';
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

	getPassportInstance(): PassportStatic {
		return passport;
	}

	private async verifyCallback(jwt_payload: JwtPayload, done: VerifiedCallback): Promise<void> {
		const id = jwt_payload?.userInfo?.id;

		if (!id) {
			return done(null, false);
		}

		const { data, error } = await until(() => this.userPrismaService.getUserById(id));

		if (error) {
			return done(error, false);
		} else if (!data) {
			return done(null, false);
		}

		return done(null, data);
	}
}

export default PassportService;
