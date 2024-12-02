import { ACCESS_TOKEN_SECRET } from '@/constants/environment.constants.js';
import { userPrismaService } from '@/services/prisma/user/index.js';
import { User } from '@prisma/client';
import passport, { PassportStatic } from 'passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

export class AuthService {
	private readonly jwtOptions: {
		jwtFromRequest: (req: Request) => string | null;
		secretOrKey: string;
	};

	constructor() {
		this.jwtOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: ACCESS_TOKEN_SECRET,
		};
	}

	initializePassport(): void {
		passport.use(new Strategy(this.jwtOptions, this.verifyCallback.bind(this)));
	}

	private async verifyCallback(jwt_payload: { userInfo?: { email?: string } }, done: VerifiedCallback): Promise<void> {
		const email: string | undefined = jwt_payload?.userInfo?.email;

		if (!email) {
			return done(null, false);
		}

		try {
			const user: User | null = await userPrismaService.getUserByEmail(email);

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
