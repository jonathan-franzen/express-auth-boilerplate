import passport from 'passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { prisma } from '@/config/prisma.config.js';
import { User } from '@prisma/client';

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
	new Strategy(
		jwtOptions,
		async (jwt_payload: any, done: VerifiedCallback): Promise<void> => {
			const user: User | null = await prisma.user.findUnique({
				where: {
					email: jwt_payload.userInfo.email,
				},
			});
			if (user) {
				return done(null, user);
			}
			return done(null, false);
		},
	),
);

export default passport;
