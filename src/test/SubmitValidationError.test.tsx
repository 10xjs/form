import {SubmitValidationError} from '../';

describe('SubmitValidationError', () => {
  const errors = {};
  const original = new Error();

  it('should be an instance of Error', () => {
    expect(new SubmitValidationError(errors) instanceof Error).toBe(true);
  });

  it('should have an errors property', () => {
    expect(new SubmitValidationError(errors).errors).toBe(errors);
  });

  it('should have an original property', () => {
    expect(new SubmitValidationError(errors, original).original).toBe(original);
  });
});
