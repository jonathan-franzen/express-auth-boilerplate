import { JwtService } from '@/services/jwt/jwt.service.js';
import { resetPasswordTokenPrismaService } from '@/services/prisma/reset-password-token/index.js';
import { userTokenPrismaService } from '@/services/prisma/user-token/index.js';

export const jwtService = new JwtService(userTokenPrismaService, resetPasswordTokenPrismaService);
