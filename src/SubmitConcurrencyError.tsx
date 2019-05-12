import ExtendableError from 'es6-error';

export default class SubmitConcurrencyError extends ExtendableError {
  public constructor() {
    super('Submit blocked pending current submit resolution.');
  }
}
