import * as React from 'react';

import {Interface} from './useForm';

export default React.createContext<Interface<any, any, any, any, any> | null>(
  null,
);

export type TypedContext<
  V,
  R,
  RR = R,
  E = null,
  W = null
> = React.Context<Interface<V, E, W, R, RR> | null>;
