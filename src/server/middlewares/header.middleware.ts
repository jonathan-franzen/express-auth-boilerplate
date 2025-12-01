import { RequestHandler } from 'express'
import correlator from 'express-correlation-id'

import { CORRELATOR_HEADER_NAME } from '@/constants/app.constants.js'

export const headerMiddleware: RequestHandler = (_req, res, next) => {
  res.setHeader(
    CORRELATOR_HEADER_NAME,
    correlator.getId() || 'no-discounts-correlation-id'
  )

  next()
}
