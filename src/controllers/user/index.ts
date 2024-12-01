import { UserController } from '@/controllers/user/user.controller.js';
import { userPrismaService } from '@/services/prisma/user/index.js';

export const userController = new UserController(userPrismaService);
