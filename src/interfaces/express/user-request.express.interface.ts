import { Request } from 'express';
import { User } from '@prisma/client';

export interface UserRequestExpressInterface extends Request {
	user?: User;
}
