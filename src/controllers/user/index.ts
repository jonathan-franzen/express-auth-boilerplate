import UserController from '@/controllers/user/user.controller.js';
import httpErrorService from '@/services/http-error/index.js';
import userPrismaService from '@/services/prisma/user/index.js';

const userController = new UserController(userPrismaService, httpErrorService);

export default userController;
