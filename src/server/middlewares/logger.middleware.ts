import { NextFunction, Request, Response } from 'express'

import { logger, loggerAsyncStorage } from '@/utils/logger.js'

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now()
  logger.info('Incoming request')

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Request completed', {
      context: {
        statusCode: res.statusCode,
        duration,
      },
    })
  })

  const context = {
    requestMethod: req.method,
    requestPath: req.originalUrl,
    requestSize: req.headers['content-length'] || '0',
  }

  return loggerAsyncStorage.run({ context }, () => next())
}
