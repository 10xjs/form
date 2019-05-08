import * as React from 'react';

import Context from './Context';
import {Interface} from './useForm';

export interface ProviderProps<V, R, RR = R, E = null, W = null> {
  form: Interface<V, R, RR, E, W>;
  children?: React.ReactNode;
}

const Provider = <V, R, RR = R, E = null, W = null>({
  form,
  children,
}: ProviderProps<V, R, RR, E, W>): React.ReactElement<
  typeof Context['Provider']
> => <Context.Provider value={form}>{children}</Context.Provider>;

export default Provider;

export interface TypedProvider<V, R, RR = R, E = null, W = null> {
  (props: ProviderProps<V, R, RR, E, W>): React.ReactElement<
    typeof Context['Provider']
  >;
}
