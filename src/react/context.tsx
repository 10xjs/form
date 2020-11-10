import * as React from 'react';

import {FormOptions, FormState} from '../core/formState';

import {useFormState} from './formState';

export const formContext = React.createContext<FormState<
  any,
  any,
  any,
  any
> | null>(null);

export const useForm = () => {
  const context = React.useContext(formContext);

  if (context === null) {
    throw new Error('<Form> context provider is missing.');
  }

  return context;
};

/**
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
interface FormProviderProps<VS, SD, ES = null, WS = null>
  extends FormOptions<VS, SD, ES, WS> {
  values: VS;
  children?: React.ReactNode;
}

/** @internal */
const FormProviderRefComponent: React.ForwardRefRenderFunction<
  FormState<any, any, any, any>,
  FormProviderProps<any, any, any, any>
> = (props, ref) => {
  const {values, validate, warn, onSubmit, children} = props;

  const form = useFormState(values, {
    validate,
    warn,
    onSubmit,
  });

  React.useImperativeHandle(ref, () => form, []);

  return <formContext.Provider value={form}>{children}</formContext.Provider>;
};

/**
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export const FormProvider: {
  <VS, SD, ES = null, WS = null>(
    props: FormProviderProps<VS, SD, ES, WS> &
      React.RefAttributes<FormState<VS, SD, ES, WS>>,
  ): React.ReactElement | null;
  readonly $$typeof: symbol;
} = React.forwardRef(FormProviderRefComponent);
