import express from 'express'

import { v1Router } from '@/server/routes/v1/index.js'
import { sendResponse } from '@/utils/send-response.js'

export const appRouter = express.Router()

appRouter.get('/', (_req, res) => {
  return sendResponse<'message'>(res, 200, {
    message: 'Welcome to express-auth-boilerplate!',
  })
})

appRouter.use('/v1', v1Router)
