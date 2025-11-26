import { z } from 'zod'

import { DataResponse } from '@/types/api/response.types.js'
import { User } from '@/types/user/user.types.js'
import { loginValidator } from '@/validators/auth/login.validator.js'

export type LoginRequestBody = z.infer<typeof loginValidator>['body']
export type LoginRequestCookies = z.infer<typeof loginValidator>['cookies']

export interface LoginResponseData {
  accessToken: string
  user: User
}

export interface LoginResponse extends DataResponse<LoginResponseData> {}
