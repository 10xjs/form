import {SubmitConcurrencyError} from '../';

describe('SubmitConcurrencyError', () => {
  it('should be an instance of Error', () => {
    expect(new SubmitConcurrencyError() instanceof Error).toBe(true);
  });
});
