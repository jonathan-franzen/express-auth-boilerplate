import { AsyncLocalStorage } from 'node:async_hooks'
import * as os from 'node:os'

import winston, { createLogger, format, transports } from 'winston'

import { LOG_LEVEL } from '@/config/env.config.js'

const { printf, timestamp } = format
export const loggerAsyncStorage = new AsyncLocalStorage<{
  context?: Record<string, string>
}>()

const monologLevels = {
  debug: 100,
  info: 200,
  notice: 250,
  warning: 300,
  error: 400,
  critical: 500,
  alert: 550,
  emergency: 600,
}

const logFormat = printf(({ context, extra, level, message }): string => {
  if (!context) {
    context = {}
  }

  if (typeof context !== 'object') {
    throw new Error('Log message context wrong format.')
  }

  context = {
    ...context,
    ...loggerAsyncStorage.getStore()?.context,
  }

  level =
    level === 'emerg' ? 'emergency' : level === 'crit' ? 'critical' : level

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
    type: 'discounts-api',
  })
})

export const logger = createLogger({
  format: format.combine(timestamp(), logFormat),
  level: LOG_LEVEL,
  levels: winston.config.syslog.levels,
  transports: [new transports.Console()],
})
