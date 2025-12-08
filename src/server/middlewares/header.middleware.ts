import { RequestHandler } from 'express'
import correlator from 'express-correlation-id'

import { CORRELATOR_HEADER } from '@/config/app.config.js'

export const headerMiddleware: RequestHandler = (_req, res, next) => {
  res.setHeader(
    CORRELATOR_HEADER,
    correlator.getId() || 'no-discounts-correlation-id'
  )

  next()
}
