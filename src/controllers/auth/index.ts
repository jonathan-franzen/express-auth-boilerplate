import AuthController from '@/controllers/auth/auth.controller.js';
import bcryptService from '@/services/bcrypt/index.js';
import httpErrorService from '@/services/http-error/index.js';
import jwtService from '@/services/jwt/index.js';
import mailerService from '@/services/mailer/index.js';
import resetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/index.js';
import userTokenPrismaService from '@/services/prisma/user-token/index.js';
import userPrismaService from '@/services/prisma/user/index.js';

const authController = new AuthController(
	httpErrorService,
	jwtService,
	bcryptService,
	mailerService,
	userPrismaService,
	userTokenPrismaService,
	resetPasswordTokenPrismaService,
);

export default authController;
