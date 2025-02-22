import { APP_ENV } from '@/constants/environment.constants.js';
import { TransformableInfo } from 'logform';
import { AsyncLocalStorage } from 'node:async_hooks';
import * as os from 'node:os';
import winston, { createLogger, format, transports } from 'winston';

const { printf, timestamp } = format;
export const loggerAsyncStorage = new AsyncLocalStorage<{
	context?: Record<string, string>;
}>();

const monologLevels = {
	alert: 550,
	critical: 500,
	debug: 100,
	emergency: 600,
	error: 400,
	info: 200,
	notice: 250,
	warning: 300,
};

const logFormat = printf(({ context, extra, level, message }: TransformableInfo): string => {
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
		channel: 'app',
		context: context,
		extra: extra,
		host: os.hostname(),
		level: level.toUpperCase(),
		message: message,
		monolog_level: monologLevels[level as keyof typeof monologLevels],
		type: 'express-auth-boilerplate',
	});
});

const logger = createLogger({
	format: format.combine(timestamp(), logFormat),
	level: APP_ENV === 'prod' ? 'warning' : 'debug',
	levels: winston.config.syslog.levels,
	transports: [new transports.Console()],
});

export default logger;
