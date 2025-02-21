import UserController from '@/controllers/user/user.controller.js';
import httpErrorService from '@/services/http-error/index.js';
import jwtService from '@/services/jwt/index.js';
import userTokenPrismaService from '@/services/prisma/user-token/index.js';
import userPrismaService from '@/services/prisma/user/index.js';

const userController = new UserController(userPrismaService, userTokenPrismaService, jwtService, httpErrorService);

export default userController;
