import * as React from 'react';

import Context from './Context';
import Provider from './Provider';
import useForm, {
  Interface,
  Warn,
  Validate,
  OnSubmit,
  OnSubmitFail,
  OnSubmitSuccess,
} from './useForm';

export interface FormProps<V, R, RR = R, E = null, W = null> {
  values: V;
  warn?: Warn<V, W>;
  validate?: Validate<V, E>;
  onSubmit?: OnSubmit<V, R>;
  onSubmitFail?: OnSubmitFail<RR>;
  onSubmitSuccess?: OnSubmitSuccess<R, RR>;
  children?: React.ReactNode;
}

export const renderForm = function Form<V, R, RR, E, W>(
  {
    values,
    validate,
    warn,
    onSubmit,
    onSubmitFail,
    onSubmitSuccess,
    children,
  }: FormProps<V, R, RR, E, W>,
  ref?: React.Ref<Interface<V, R, RR, E, W>>,
): React.ReactElement<typeof Context['Provider']> {
  const form = useForm({
    values,
    onSubmit,
    onSubmitFail,
    onSubmitSuccess,
    validate,
    warn,
  });

  React.useImperativeHandle(ref, (): Interface<V, R, RR, E, W> => form, []);

  return <Provider form={form}>{children}</Provider>;
};

const component = (React.forwardRef as any)(renderForm);

interface Form {
  <V, R, RR = R, E = null, W = null>(
    props: FormProps<V, R, RR, E, W> &
      React.RefAttributes<Interface<V, R, RR, E, W>>,
  ): React.ReactElement<typeof Context['Provider']>;
}

export default component as Form;

export interface TypedForm<V, R, RR = R, E = null, W = null> {
  (
    props: FormProps<V, R, RR, E, W> &
      React.RefAttributes<Interface<V, R, RR, E, W>>,
  ): React.ReactElement<typeof Context['Provider']>;
}
