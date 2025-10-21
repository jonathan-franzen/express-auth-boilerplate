import { z } from 'zod'

import { changePasswordValidator } from '@/validators/user/change-password.validator.js'

export type ChangePasswordRequestBody = z.infer<
  typeof changePasswordValidator
>['body']

export interface ChangePasswordResponseData {
  accessToken: string
}
