import * as React from 'react';

import {formContext} from './formContext';
import {Interface} from './useForm';

export interface FormProviderProps<V, R, RR = R, E = null, W = null> {
  form: Interface<V, R, RR, E, W>;
  children?: React.ReactNode;
}

export const FormProvider = <V, R, RR = R, E = null, W = null>({
  form,
  children,
}: FormProviderProps<V, R, RR, E, W>): React.ReactElement<
  typeof formContext['Provider']
> => <formContext.Provider value={form}>{children}</formContext.Provider>;

export interface TypedFormProvider<V, R, RR = R, E = null, W = null> {
  (props: FormProviderProps<V, R, RR, E, W>): React.ReactElement<
    typeof formContext['Provider']
  >;
}
