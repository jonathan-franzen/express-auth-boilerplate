import createError, { HttpError } from 'http-errors';

class HttpErrorService {
	invalidCredentialsError(): HttpError<401> {
		return createError(401, 'Invalid credentials.');
	}

	tokenInvalidError(): HttpError<401> {
		return createError(401, 'Token invalid.');
	}

	tokenExpiredError(): HttpError<401> {
		return createError(401, 'Token expired.');
	}

	notFoundError(resource = 'Resource'): HttpError<404> {
		return createError(404, `${resource} not found.`);
	}

	emailAlreadyInUseError(): HttpError<409> {
		return createError(409, 'Email already in use.');
	}

	unableToDeleteSelfError(): HttpError<409> {
		return createError(409, 'You cannot delete your own account.');
	}

	internalServerError(): HttpError<500> {
		return createError(500, 'Internal server error.');
	}
}

export default HttpErrorService;
