import { PORT } from '@/constants/environment.constants.js';
import { loggerMiddleware } from '@/middlewares/logger.middleware.js';
import router from '@/routes/router.js';
import { passportService } from '@/services/passport/index.js';
import logger from '@/utils/logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';

const app: Express = express();

app.use(cookieParser());
app.use(
	cors({
		origin: ['http://localhost:3000'],
		credentials: true,
	}),
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passportService.getPassportInstance().initialize());
app.use(loggerMiddleware());
app.use(router);

app.listen(PORT, (): void => {
	logger.info(`App listening on port ${PORT}`);
});
