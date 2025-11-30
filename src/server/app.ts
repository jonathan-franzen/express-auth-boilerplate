import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application } from 'express'
import correlator from 'express-correlation-id'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { Server } from 'http'

import { corsOptionsConfig } from '@/config/cors-options.config.js'
import expressRateLimitConfig from '@/config/express-rate-limit.config.js'
import { CORRELATOR_HEADER_NAME } from '@/constants/app.constants.js'
import { PORT } from '@/constants/environment.constants.js'
import { errorHandlerMiddleware } from '@/server/middlewares/error-handler.middleware.js'
import { headerMiddleware } from '@/server/middlewares/header.middleware.js'
import { ipBlockerMiddleware } from '@/server/middlewares/ip-blocker.middleware.js'
import { loggerMiddleware } from '@/server/middlewares/logger.middleware.js'
import { appRouter } from '@/server/routes/index.js'
import { httpErrorService } from '@/server/services/error/index.js'
import { logger } from '@/utils/logger.js'
import { sendResponse } from '@/utils/send-response.js'

class AppServer {
  private server: Server | null = null
  private static instance: AppServer | null = null
  private readonly app: Application
  private readonly port: number

  private constructor() {
    this.app = express()
    this.port = Number(PORT) || 8000
    this.configureApp()
  }

  public static getInstance(): AppServer {
    if (!AppServer.instance) {
      AppServer.instance = new AppServer()
    }
    return AppServer.instance
  }

  private configureApp(): void {
    this.app.use(cors(corsOptionsConfig))
    this.app.use(helmet())
    this.app.use(correlator({ header: CORRELATOR_HEADER_NAME }))
    this.app.use(loggerMiddleware)
    this.app.use(cookieParser())
    this.app.use(
      express.json({
        type: ['application/json', 'text/plain'],
        limit: '5MB',
      })
    )
    this.app.use(headerMiddleware)
    this.app.use(ipBlockerMiddleware)
    this.app.use(rateLimit(expressRateLimitConfig))
    this.app.use(appRouter)
    this.app.use(errorHandlerMiddleware)
    this.app.use((_req, res) => {
      const notFoundError = httpErrorService.notFoundError('Route')

      return sendResponse<'error'>(res, notFoundError.status, {
        message: notFoundError.message,
        error: notFoundError.name,
      })
    })
  }

  public getApp(): Application {
    return this.app
  }

  public async start(): Promise<void> {
    if (this.server) {
      logger.info('Discounts API is already running')
      return
    }
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Discounts API listening on port ${this.port}`)
        resolve()
      })
    })
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            logger.error('Error closing Discounts API:', {
              error: error.message,
            })
            reject(error)
          } else {
            logger.info('Discounts API closed successfully')
            this.server = null
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }
}

const getAppServer = AppServer.getInstance

export { getAppServer }
