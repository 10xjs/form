import SubmitValidationError from '../src/SubmitValidationError';

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

  it('should convert unexpected values to null', () => {
    expect(new SubmitValidationError(undefined as any).errors).toBe(null);
    expect(new SubmitValidationError(2 as any).errors).toBe(null);
    expect(new SubmitValidationError([] as any).errors).toBe(null);
    expect(new SubmitValidationError('foo' as any).errors).toBe(null);
    expect(new SubmitValidationError((() => {}) as any).errors).toBe(null);
  });
});
