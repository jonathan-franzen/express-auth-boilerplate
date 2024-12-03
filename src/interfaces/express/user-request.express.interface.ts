import { Prisma } from '@prisma/client';
import { Request } from 'express';

import UserGetPayload = Prisma.UserGetPayload;

export interface UserRequestExpressInterface extends Request {
	user?: UserGetPayload<{ omit: { password: true } }>;
}
