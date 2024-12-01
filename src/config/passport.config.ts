import passport from 'passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { User } from '@prisma/client';
import { userPrismaService } from '@/services/prisma/user/index.js';

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
	new Strategy(
		jwtOptions,
		async (
			jwt_payload: { userInfo?: { email?: string } },
			done: VerifiedCallback,
		): Promise<void> => {
			const email: string | undefined = jwt_payload?.userInfo?.email;

			if (!email) {
				return done(null, false);
			}

			const user: User | null = await userPrismaService.getUserByEmail(email);

			if (!user) {
				return done(null, false);
			}
			return done(null, user);
		},
	),
);

export default passport;
