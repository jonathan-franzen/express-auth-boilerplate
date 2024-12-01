import express, { Router } from 'express';
import { authRouter } from '@/routes/auth.router.js';
import { userRouter } from '@/routes/user.router.js';
import passport from '@/config/passport.config.js';

const router: Router = express.Router();

router.use(authRouter);

router.use(passport.authenticate('jwt', { session: false }));

router.use('/users', userRouter);

export default router;
