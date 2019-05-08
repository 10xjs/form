import * as React from 'react';

import Context from './Context';
import {Interface} from './useForm';

const useContext = <V, R, RR = R, E = null, W = null>(): Interface<
  V,
  R,
  RR,
  E,
  W
> => {
  const context = React.useContext(Context);

  if (context === null) {
    throw new Error('<Form> context provider is missing.');
  }

  return context;
};

export default useContext;

export interface TypedUseContext<V, R, RR = R, E = null, W = null> {
  (): Interface<V, R, RR, E, W>;
}
