import { JwtPayload } from 'jsonwebtoken';

export interface JwtVerifyResolveJwtInterface {
	(value: JwtPayload | PromiseLike<JwtPayload>): void;
}
