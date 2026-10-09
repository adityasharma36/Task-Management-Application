
export interface AppError extends Error {
  statusCode: number;
}

export class InternalError extends Error implements AppError {
  statusCode: number;

  constructor(msg = "Internal server error") {
    super(msg);
    this.name = "InternalError";
    this.statusCode = 500;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends Error implements AppError {
  statusCode: number;

  constructor(msg = "Bad request") {
    super(msg);
    this.name = "BadRequestError";
    this.statusCode = 400;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode: number;

  constructor(msg = "Resource not found") {
    super(msg);
    this.name = "NotFoundError";
    this.statusCode = 404;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotImplementError extends Error implements AppError {
  statusCode: number;

  constructor(msg = "Feature not implemented") {
    super(msg);
    this.name = "NotImplementError";
    this.statusCode = 501;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConflictError extends Error implements AppError {
  statusCode: number;

  constructor(msg = "Resource already exists") {
    super(msg);
    this.name = "ConflictError";
    this.statusCode = 409;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}