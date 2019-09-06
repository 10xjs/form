import ExtendableError from 'es6-error';

export class SubmitConcurrencyError extends ExtendableError {
  public constructor() {
    super('Submit blocked pending current submit resolution.');
  }
}
