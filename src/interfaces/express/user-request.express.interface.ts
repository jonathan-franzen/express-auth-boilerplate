import { Prisma } from '@prisma/client';
import { Request } from 'express';

import UserGetPayload = Prisma.UserGetPayload;

export default interface UserRequestExpressInterface extends Request {
	user?: UserGetPayload<{ omit: { password: true } }>;
}
