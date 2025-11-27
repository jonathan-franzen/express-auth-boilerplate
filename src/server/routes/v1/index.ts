import { Router } from 'express'

import { authRouter } from '@/server/routes/v1/auth.router.js'
import { userRouter } from '@/server/routes/v1/user.router.js'

const v1Router = Router()

v1Router.use('/auth', authRouter)

v1Router.use('/users', userRouter)

export { v1Router }
