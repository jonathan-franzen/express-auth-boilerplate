import { Router } from 'express'

import { passport } from '@/config/passport/index.js'
import { authRouter } from '@/server/routes/v1/auth.router.js'
import { userRouter } from '@/server/routes/v1/user.router.js'

const v1Router = Router()

v1Router.use('/auth', authRouter)

v1Router.use(
  passport
    .getPassportInstance()
    .authenticate('jwt', { session: false, failWithError: true })
)

v1Router.use('/users', userRouter)

export { v1Router }
