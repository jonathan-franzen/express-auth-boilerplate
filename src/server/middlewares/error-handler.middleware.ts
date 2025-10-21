import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import {
  httpErrorService,
  prismaErrorService,
} from '@/server/services/error/index.js'
import { logger } from '@/utils/logger.js'
import { sendResponse } from '@/utils/send-response.js'

const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  const baseErrorKeys = {
    ...(req.method && { method: req.method }),
    ...(req.query && Object.keys(req.query).length > 0 && { query: req.query }),
    ...(req.body && Object.keys(req.body).length > 0 && { body: req.body }),
  }

  if (error instanceof ZodError) {
    const message =
      error.issues.at(0)?.message ?? 'Request failed zod validation'

    logger.error(message, {
      context: {
        error: error.name,
        errors: error.issues,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, 400, {
      message: message,
      error: error.name,
    })
  }

  if (httpErrorService.isHttpError(error)) {
    logger.error(error.message, {
      context: {
        error: error.name,
        stack: error.stack,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, error.status, {
      message: error.message,
      error: error.name,
    })
  }

  if (prismaErrorService.isPrismaError(error)) {
    const { message, statusCode } = prismaErrorService.handlePrismaError(error)
    const prismaError = 'PrismaError'

    logger.error(message, {
      context: {
        error: prismaError,
        stack: error.stack,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, statusCode, {
      message: message,
      error: prismaError,
    })
  }

  if (error instanceof Error) {
    logger.error(error.message, {
      context: {
        error: error.name,
        stack: error.stack,
        ...baseErrorKeys,
      },
    })

    return sendResponse<'error'>(res, 500, {
      message: error.message,
      error: error.name,
    })
  }

  const internalServerError = httpErrorService.internalServerError()

  logger.error(internalServerError.message, {
    context: {
      error: internalServerError.name,
      ...(error.stack && { stack: error.stack }),
      ...baseErrorKeys,
    },
  })

  return sendResponse<'error'>(res, internalServerError.status, {
    message: internalServerError.message,
    error: internalServerError.name,
  })
}

export { errorHandlerMiddleware }
