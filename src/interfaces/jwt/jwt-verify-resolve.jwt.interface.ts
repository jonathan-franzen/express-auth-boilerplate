import { JwtPayload } from 'jsonwebtoken';

export default interface JwtVerifyResolveJwtInterface {
	(value: JwtPayload | PromiseLike<JwtPayload>): void;
}
