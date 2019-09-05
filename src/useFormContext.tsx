import * as React from 'react';

import {formContext} from './formContext';
import {Interface} from './useForm';

export const useContext = <V, R, RR = R, E = null, W = null>(): Interface<
  V,
  R,
  RR,
  E,
  W
> => {
  const context = React.useContext(formContext);

  if (context === null) {
    throw new Error('<Form> context provider is missing.');
  }

  return context;
};

export interface TypedUseContext<V, R, RR = R, E = null, W = null> {
  (): Interface<V, R, RR, E, W>;
}
