import { PassportService } from '@/services/passport/passport.service.js';
import { userPrismaService } from '@/services/prisma/user/index.js';

export const passportService = new PassportService(userPrismaService);
