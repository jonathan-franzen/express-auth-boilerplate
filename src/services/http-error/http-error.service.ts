import createError from 'http-errors';

export default class HttpErrorService {
	invalidCredentialsError() {
		return createError(401, 'Invalid credentials.');
	}

	tokenInvalidError() {
		return createError(401, 'Token invalid.');
	}

	tokenExpiredError() {
		return createError(401, 'Token expired.');
	}

	notFoundError(resource = 'Resource') {
		return createError(404, `${resource} not found.`);
	}

	emailAlreadyInUseError() {
		return createError(409, 'Email already in use.');
	}

	internalServerError() {
		return createError(500, 'Internal server error.');
	}
}
