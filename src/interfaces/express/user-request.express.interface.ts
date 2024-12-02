import { User } from '@prisma/client';
import { Request } from 'express';

export interface UserRequestExpressInterface extends Request {
	user?: User;
}
