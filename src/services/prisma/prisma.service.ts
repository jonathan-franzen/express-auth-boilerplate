import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

class PrismaService {
	recordNotExistError(err: unknown) {
		return err instanceof PrismaClientKnownRequestError && err.code === 'P2025';
	}
}

export default PrismaService;
