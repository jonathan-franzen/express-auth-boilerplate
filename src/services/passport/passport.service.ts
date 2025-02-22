import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import UserPrismaService from '@/services/prisma/user/user.prisma.service.js';
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

	private verifyCallback(jwt_payload: { userInfo?: { id?: string } }, done: VerifiedCallback): void {
		const id = jwt_payload?.userInfo?.id as string;

		if (!id) {
			return done(undefined, false);
		}

		void this.userPrismaService
			.getUserById(id)
			.catch((error) => {
				return done(error, false);
			})
			.then((data) => {
				if (!data) {
					return done(undefined, false);
				}

				return done(undefined, data);
			});
	}
}

export default PassportService;
