// @flow strict

import ExtendableError from 'es6-error';
import type {State} from './types';

export default class SubmitValidationError extends ExtendableError {
  errors: State | null;
  original: Error | void;

  constructor(errors: State, original?: Error) {
    super('Submit Validation Failed');

    if (typeof errors === 'object' && !Array.isArray(errors)) {
      this.errors = errors;
    } else {
      this.errors = null;
    }

    this.original = original;
  }
}
