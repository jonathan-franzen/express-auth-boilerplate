import createError, { HttpError } from 'http-errors';

class HttpErrorService {
	emailAlreadyInUseError(): HttpError<409> {
		return createError(409, 'Email already in use.');
	}

	incorrectPasswordError(): HttpError<401> {
		return createError(401, 'Incorrect password.');
	}

	internalServerError(): HttpError<500> {
		return createError(500, 'Internal server error.');
	}

	invalidCredentialsError(): HttpError<401> {
		return createError(401, 'Invalid credentials.');
	}

	notFoundError(resource = 'Resource'): HttpError<404> {
		return createError(404, `${resource} not found.`);
	}

	tokenExpiredError(): HttpError<401> {
		return createError(401, 'Token expired.');
	}

	tokenInvalidError(): HttpError<401> {
		return createError(401, 'Token invalid.');
	}

	unableToDeleteSelfError(): HttpError<409> {
		return createError(409, 'You cannot delete your own account.');
	}
}

export default HttpErrorService;
