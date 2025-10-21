import { z } from 'zod'

import { refreshValidator } from '@/validators/auth/refresh.validator.js'

export type RefreshRequestCookies = z.infer<typeof refreshValidator>['cookies']

export interface RefreshResponseData {
  accessToken: string
}
