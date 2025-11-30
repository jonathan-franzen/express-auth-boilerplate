import { User } from '@/types/user.types.js'

declare global {
  namespace Express {
    export interface Request {
      user?: User
    }
  }
}
