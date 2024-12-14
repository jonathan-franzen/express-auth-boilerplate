import JwtService from '@/services/jwt/jwt.service.js';
import resetPasswordTokenPrismaService from '@/services/prisma/reset-password-token/index.js';
import userTokenPrismaService from '@/services/prisma/user-token/index.js';
import userPrismaService from '@/services/prisma/user/index.js';

const jwtService = new JwtService(userPrismaService, userTokenPrismaService, resetPasswordTokenPrismaService);

export default jwtService;
