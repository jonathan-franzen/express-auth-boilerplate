import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export default class PrismaService {
	recordNotExistError(err: unknown) {
		return (err instanceof PrismaClientKnownRequestError && err.code === 'P2025');
	}
}
