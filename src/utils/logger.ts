import { AsyncLocalStorage } from 'async_hooks';
import * as os from 'os';
import { APP_ENV } from '@/constants/environment.constants.js';
import { TransformableInfo } from 'logform';
import winston, { createLogger, format, transports } from 'winston';

const { timestamp, printf } = format;
export const loggerAsyncStorage = new AsyncLocalStorage<{
	context?: Record<string, string>;
}>();

const monologLevels = {
	emergency: 600,
	alert: 550,
	critical: 500,
	error: 400,
	warning: 300,
	notice: 250,
	info: 200,
	debug: 100,
};

const logFormat = printf(({ level, message, context, extra }: TransformableInfo): string => {
	if (!context) {
		context = {};
	}

	if (typeof context !== 'object') {
		console.error('Log message context wrong format.');
		throw new Error('Internal Server Error.');
	}

	context = {
		...context,
		...loggerAsyncStorage.getStore()?.context,
	};

	level = level === 'emerg' ? 'emergency' : level === 'crit' ? 'critical' : level;

	return JSON.stringify({
		'@timestamp': new Date().toISOString(),
		'@version': 1,
		host: os.hostname(),
		message: message,
		type: 'express-auth-boilerplate',
		channel: 'app',
		level: level.toUpperCase(),
		monolog_level: monologLevels[level as keyof typeof monologLevels],
		extra: extra,
		context: context,
	});
});

const logger = createLogger({
	level: APP_ENV === 'prod' ? 'warning' : 'debug',
	format: format.combine(timestamp(), logFormat),
	transports: [new transports.Console()],
	levels: winston.config.syslog.levels,
});

export default logger;
