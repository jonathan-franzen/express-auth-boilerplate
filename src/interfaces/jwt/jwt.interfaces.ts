import { JwtPayload } from 'jsonwebtoken';

export interface JwtDecodedRefreshTokenInterface {
	email: string;
}

export interface JwtDecodedResetPasswordTokenInterface {
	resetPassword: {
		email: string;
	};
}

export interface JwtDecodedVerifyEmailTokenInterface {
	alreadyVerified?: boolean;
	verifyEmail: {
		email: string;
	};
}

export interface JwtVerifyRejectJwtInterface {
	(reason?: Error | string): void;
}

export interface JwtVerifyResolveJwtInterface {
	(value: JwtPayload | PromiseLike<JwtPayload>): void;
}
