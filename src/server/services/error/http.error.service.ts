import createError, { HttpError } from 'http-errors'

export class HttpErrorService {
  isHttpError(err: HttpError) {
    return createError.isHttpError(err)
  }

  tokenExpiredError(): HttpError<401> {
    return createError(401, 'Token expired.')
  }

  tokenInvalidError(): HttpError<401> {
    return createError(401, 'Token invalid.')
  }

  incorrectPasswordError(): HttpError<401> {
    return createError(401, 'Incorrect password.')
  }

  invalidCredentialsError(): HttpError<401> {
    return createError(401, 'Invalid credentials.')
  }

  notFoundError(resource = 'Resource'): HttpError<404> {
    return createError(404, `${resource} not found.`)
  }

  emailAlreadyInUseError(): HttpError<409> {
    return createError(409, 'Email already in use.')
  }

  unableToDeleteSelfError(): HttpError<409> {
    return createError(409, 'You cannot delete your own account.')
  }

  teapotError(): HttpError<418> {
    return createError(418, 'Something went wrong')
  }

  emailRequestsExceededError(ttl: number): HttpError<429> {
    return createError(
      429,
      `Please wait ${ttl} seconds before requesting another email.`
    )
  }

  internalServerError(): HttpError<500> {
    return createError(500, 'Internal server error.')
  }
}
