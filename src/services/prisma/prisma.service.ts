import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

class PrismaService {
	recordNotExistError(err: unknown): boolean {
		return err instanceof PrismaClientKnownRequestError && err.code === 'P2025';
	}
}

export default PrismaService;
