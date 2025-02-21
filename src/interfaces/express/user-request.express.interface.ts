import { UserPrismaInterface } from '@/interfaces/prisma/user/user.prisma.interfaces.js';
import { Request } from 'express';

interface UserRequestExpressInterface extends Request {
	user: UserPrismaInterface;
}

export default UserRequestExpressInterface;
