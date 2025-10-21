import { z } from 'zod'

const loginRequestBody = z.object({
  email: z.email(),
  password: z.string().nonempty('Password is required.'),
})

const loginRequestCookies = z.object({
  refreshToken: z.string().nonempty('Refresh token is required.'),
})

export const loginValidator = z.object({
  body: loginRequestBody,
  cookies: loginRequestCookies,
})
