import { JwtPayload } from 'jsonwebtoken';

export interface JwtVerifyRejectJwtInterface {
	(reason?: Error | string): void;
}

export interface JwtVerifyResolveJwtInterface {
	(value: JwtPayload | PromiseLike<JwtPayload>): void;
}
