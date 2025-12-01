import { ErrorRequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'

import {
  httpErrorService,
  prismaErrorService,
} from '@/server/services/error/index.js'
import { logger } from '@/utils/logger.js'
import { sendResponse } from '@/utils/send-response.js'

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  _next
) => {
  const baseErrorKeys = {
    ...(req.method && { method: req.method }),
    ...(req.query && Object.keys(req.query).length > 0 && { query: req.query }),
    ...(req.body && Object.keys(req.body).length > 0 && { body: req.body }),
  }

  if (err instanceof jwt.TokenExpiredError) {
    err = httpErrorService.tokenExpiredError()
  }

  if (err instanceof jwt.JsonWebTokenError) {
    err = httpErrorService.tokenInvalidError()
  }

  if (err instanceof ZodError) {
    const message = err.issues.at(0)?.message ?? 'Request failed zod validation'

    logger.error(message, {
      context: {
        error: err.name,
        errors: err.issues,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, 400, {
      message: message,
      error: err.name,
    })
  }

  if (httpErrorService.isHttpError(err)) {
    logger.error(err.message, {
      context: {
        error: err.name,
        stack: err.stack,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, err.status, {
      message: err.message,
      error: err.name,
    })
  }

  if (prismaErrorService.isPrismaError(err)) {
    const { message, statusCode } = prismaErrorService.handlePrismaError(err)
    const prismaError = 'PrismaError'

    logger.error(message, {
      context: {
        error: prismaError,
        stack: err.stack,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, statusCode, {
      message: message,
      error: prismaError,
    })
  }

  if (err instanceof Error) {
    logger.error(err.message, {
      context: {
        error: err.name,
        stack: err.stack,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, 500, {
      message: err.message,
      error: err.name,
    })
  }

  const internalServerError = httpErrorService.internalServerError()

  logger.error(internalServerError.message, {
    context: {
      error: internalServerError.name,
      ...(err.stack && { stack: err.stack }),
      ...baseErrorKeys,
    },
  })

  return sendResponse<'error'>(res, internalServerError.status, {
    message: internalServerError.message,
    error: internalServerError.name,
  })
}
