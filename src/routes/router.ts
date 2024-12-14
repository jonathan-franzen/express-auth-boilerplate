import authRouter from '@/routes/auth.router.js';
import userRouter from '@/routes/user.router.js';
import passportService from '@/services/passport/index.js';
import express, { Router } from 'express';

const router: Router = express.Router();

router.get('/', (_req, res) => {
	res.json({ message: 'Welcome to express-auth-boilerplate!' });
});

router.use(authRouter);

router.use(passportService.getPassportInstance().authenticate('jwt', { session: false }));

router.use('/users', userRouter);

export default router;
