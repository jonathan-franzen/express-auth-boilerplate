import { CorsOptions } from 'cors'

import { FRONTEND_URL } from '@/constants/environment.constants.js'
import { logger } from '@/utils/logger.js'

const corsOptionsConfig: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, origin?: boolean) => void
  ) => {
    const allowedDomains = FRONTEND_URL.split(',').map((domain) =>
      domain.trim()
    )

    // Allow requests with no origin (like mobile apps)
    if (!origin) {
      return callback(null, true)
    }

    if (allowedDomains.includes(origin)) {
      callback(null, true)
    } else {
      logger.warning(`Blocked request from unauthorized origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Allow credentials (cookies, auth headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'QUERY', 'OPTIONS'],
}

export { corsOptionsConfig }
