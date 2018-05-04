// @flow strict

import ExtendableError from 'es6-error';
import type {State} from './types';

export default class SubmitValidationError extends ExtendableError {
  errors: State;
  original: Error | void;

  constructor(errors: State, original?: Error) {
    super('Submit Validation Failed');

    this.original = original;
    this.errors = errors;
  }
}
