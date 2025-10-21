import { NextFunction, Request, Response } from 'express'

import { httpErrorService } from '@/server/services/error/index.js'

const IP_BLOCKLIST = ['']

const ipBlockerMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = req.socket.remoteAddress ?? ''

  if (IP_BLOCKLIST.includes(ip)) {
    throw httpErrorService.teapotError()
  }

  next()
}

export { ipBlockerMiddleware }
