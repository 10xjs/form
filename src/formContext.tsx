import * as React from 'react';

import {Interface} from './useForm';

export const formContext = React.createContext<Interface<
  any,
  any,
  any,
  any,
  any
> | null>(null);

export type TypedFormContext<
  V,
  R,
  RR = R,
  E = null,
  W = null
> = React.Context<Interface<V, E, W, R, RR> | null>;
