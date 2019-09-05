import * as React from 'react';

import {render} from '@testing-library/react';

import {useContext} from '../';

describe('useContext hook', () => {
  it('should throw an error if the context provider is missing', () => {
    const ContextConsumer = (): null => {
      useContext();
      return null;
    };

    /* eslint-disable no-console */
    const error = console.error;

    console.error = jest.fn();

    expect(() => render(<ContextConsumer />)).toThrow(
      '<Form> context provider is missing.',
    );

    console.error = error;
    /* eslint-enable no-console */
  });
});
