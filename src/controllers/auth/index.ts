import { AuthController } from '@/controllers/auth/auth.controller.js';
import { jwtService } from '@/services/jwt/index.js';
import { userPrismaService } from '@/services/prisma/user/index.js';
import { userTokenPrismaService } from '@/services/prisma/user-token/index.js';
import { bcryptService } from '@/services/bcrypt/index.js';
import { resetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/index.js';
import { mailerService } from '@/services/mailer/index.js';

export const authController = new AuthController(
	jwtService,
	bcryptService,
	mailerService,
	userPrismaService,
	userTokenPrismaService,
	resetPasswordTokenPrismaService,
);
