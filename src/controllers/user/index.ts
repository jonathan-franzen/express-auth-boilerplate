import UserController from '@/controllers/user/user.controller.js';
import bcryptService from '@/services/bcrypt/index.js';
import httpErrorService from '@/services/http-error/index.js';
import jwtService from '@/services/jwt/index.js';
import userTokenPrismaService from '@/services/prisma/user-token/index.js';
import userPrismaService from '@/services/prisma/user/index.js';

const userController = new UserController(userPrismaService, userTokenPrismaService, bcryptService, jwtService, httpErrorService);

export default userController;
