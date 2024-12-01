import { AuthController } from '@/controllers/auth/auth.controller.js';
import { encryptionService } from '@/services/encryption/index.js';
import { jwtService } from '@/services/jwt/index.js';
import { userPrismaService } from '@/services/prisma/user/index.js';
import { userTokenPrismaService } from '@/services/prisma/user-token/index.js';

export const authController = new AuthController(
	jwtService,
	encryptionService,
	userPrismaService,
	userTokenPrismaService,
);
