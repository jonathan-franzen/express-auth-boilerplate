import { authRouter } from '@/routes/auth.router.js';
import { userRouter } from '@/routes/user.router.js';
import { authService } from '@/services/auth/index.js';
import express, { Router } from 'express';

const router: Router = express.Router();

router.use(authRouter);

router.use(authService.getPassportInstance().authenticate('jwt', { session: false }));

router.use('/users', userRouter);

export default router;
