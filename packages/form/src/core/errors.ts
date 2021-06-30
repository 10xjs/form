export abstract class SubmitError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: new.target.name,
      writable: true,
    });

    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, new.target);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class SubmitValidationError<T = unknown> extends SubmitError {
  errors: T;

  constructor(errors: T) {
    super('submit failed with validation errors');

    this.errors = errors;
  }
}
