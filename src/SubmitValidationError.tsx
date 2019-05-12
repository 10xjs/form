import ExtendableError from 'es6-error';

export default class SubmitValidationError extends ExtendableError {
  public errors: unknown;
  public original: Error | void;

  public constructor(errors: unknown, original?: Error) {
    super('Submit Validation Failed');

    this.errors = errors;

    this.original = original;
  }
}
