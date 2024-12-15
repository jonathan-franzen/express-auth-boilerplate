import expressRateLimitConfig from '@/config/express-rate-limit.config.js';
import { FRONTEND_URL, PORT } from '@/constants/environment.constants.js';
import errorHandlerMiddleware from '@/middlewares/error-handler.middleware.js';
import loggerMiddleware from '@/middlewares/logger.middleware.js';
import router from '@/routes/router.js';
import passportService from '@/services/passport/index.js';
import logger from '@/utils/logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';

const app: Express = express();

app.disable('x-powered-by');

app.use(rateLimit(expressRateLimitConfig));

app.use(cookieParser());

app.use(
	cors({
		origin: [FRONTEND_URL],
		credentials: true,
	}),
);

app.use(express.urlencoded({ extended: false }));

app.use(
	express.json({
		limit: '1MB',
	}),
);

app.use(rateLimit(expressRateLimitConfig));

// @ts-ignore
app.use(passportService.getPassportInstance().initialize());

app.use(loggerMiddleware());

app.use(router);

app.use(errorHandlerMiddleware);

app.listen(PORT, (): void => {
	logger.info(`App listening on port ${PORT}`);
});

export const handler = serverless(app);
