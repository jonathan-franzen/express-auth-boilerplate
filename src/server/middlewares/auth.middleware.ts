import { passport } from '@/config/passport/index.js'

export const authMiddleware = passport
  .getPassportInstance()
  .authenticate('jwt', { session: false, failWithError: true })
