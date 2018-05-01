// @flow
import type {State} from './types';

export default class SubmitValidationError extends Error {
  errors: ?State;
  original: Error | void;

  constructor(errors: ?State, original?: Error) {
    const message = 'Submit Validation Failed';
    super(message);

    Object.defineProperties(this, {
      message: {
        enumerable: false,
        value: message,
      },
      name: {
        enumerable: false,
        value: this.constructor.name,
      },
      errors: {
        enumerable: false,
        value: errors,
      },
      original: {
        enumerable: false,
        value: original,
      },
    });

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
      return;
    }

    Object.defineProperty(this, 'stack', {
      configurable: true,
      enumerable: false,
      value: new Error(message).stack,
      writable: true,
    });
  }
}

export const unwrapError = (error: Error) =>
  error instanceof SubmitValidationError
    ? [error.original, error]
    : [error, null];
