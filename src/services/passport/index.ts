import PassportService from '@/services/passport/passport.service.js';
import userPrismaService from '@/services/prisma/user/index.js';

const passportService = new PassportService(userPrismaService);

export default passportService;
