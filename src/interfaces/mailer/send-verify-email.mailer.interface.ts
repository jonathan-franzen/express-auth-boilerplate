import { Prisma } from '@prisma/client';

import UserGetPayload = Prisma.UserGetPayload;

interface SendVerifyEmailMailerInterface {
	user: UserGetPayload<{ omit: { password: true; roles: true } }>;
	verifyToken: string;
}

export default SendVerifyEmailMailerInterface;
