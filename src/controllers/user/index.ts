import UserController from '@/controllers/user/user.controller.js';
import userPrismaService from '@/services/prisma/user/index.js';

const userController = new UserController(userPrismaService);

export default userController;
