import { UserPrismaInterface } from '@/interfaces/prisma/user/user.prisma.interfaces.js';
import { Request } from 'express';

export interface UserRequestExpressInterface extends Request {
	user: UserPrismaInterface;
}
