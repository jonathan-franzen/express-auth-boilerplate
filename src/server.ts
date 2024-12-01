import express, { Express } from 'express';
import passport from '@/config/passport.config.js';
import router from '@/routes/router.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { loggerMiddleware } from '@/middlewares/logger.middleware.js';
import logger from '@/utils/logger.js';

const app: Express = express();

const PORT: string = process.env.PORT || '3000';

app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(loggerMiddleware());
app.use(router);

app.listen(PORT, (): void => {
	logger.info(`App listening on port ${PORT}`);
});
