import 'tsconfig-paths/register.js';
import expressRateLimitConfig from '@/config/express-rate-limit.config.js';
import { AWS_LAMBDA_FUNCTION_NAME, FRONTEND_URL, PORT } from '@/constants/environment.constants.js';
import errorHandlerMiddleware from '@/middlewares/error-handler.middleware.js';
import loggerMiddleware from '@/middlewares/logger.middleware.js';
import router from '@/routes/index.js';
import passportService from '@/services/passport/index.js';
import logger from '@/utils/logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';

const app = express();

app.disable('x-powered-by');

app.use((req: Request, _res: Response, next: NextFunction) => {
	logger.info(`Incoming Request: ${req.method} ${req.url}`);
	next();
});

app.use(rateLimit(expressRateLimitConfig));

app.use(cookieParser());

app.use(
	cors({
		credentials: true,
		origin: [FRONTEND_URL],
	}),
);

app.use(express.urlencoded({ extended: false }));

app.use(
	express.json({
		limit: '1MB',
	}),
);

app.use(passportService.getPassportInstance().initialize());

app.use(loggerMiddleware());

app.use(router);

app.use(errorHandlerMiddleware);

if (!AWS_LAMBDA_FUNCTION_NAME) {
	app.listen(PORT, () => {
		logger.info(`App listening on port ${PORT}`);
	});
}

export const handler = serverless(app);
