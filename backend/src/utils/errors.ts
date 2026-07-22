export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    errors: Array<{ field?: string; message: string }> = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ValidationAppError extends AppError {
  constructor(message = "Validation failed", errors: Array<{ field?: string; message: string }> = []) {
    super(message, 422, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You are not authorized to perform this action") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Record not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicting record exists") {
    super(message, 409);
  }
}
