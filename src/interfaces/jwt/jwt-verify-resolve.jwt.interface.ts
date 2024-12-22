import { JwtPayload } from 'jsonwebtoken';

interface JwtVerifyResolveJwtInterface {
	(value: JwtPayload | PromiseLike<JwtPayload>): void;
}

export default JwtVerifyResolveJwtInterface;
