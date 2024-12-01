import { JwtService } from '@/services/jwt/jwt.service.js';
import { userTokenPrismaService } from '@/services/prisma/user-token/index.js';

export const jwtService = new JwtService(userTokenPrismaService);
