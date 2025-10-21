import { z } from 'zod'

import { loginValidator } from '@/validators/auth/login.validator.js'

export type LoginRequestBody = z.infer<typeof loginValidator>['body']
export type LoginRequestCookies = z.infer<typeof loginValidator>['cookies']

export interface LoginResponseData {
  accessToken: string
}
