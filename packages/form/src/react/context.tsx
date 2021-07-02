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
    throw new Error('Form context provider is missing.');
  }

  return context;
};

/**
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export interface FormProviderProps<
  VS,
  SD = unknown,
  ES = undefined,
  WS = undefined,
> extends FormOptions<VS, SD, ES, WS>,
    React.RefAttributes<FormState<VS, SD, ES, WS>> {
  values: VS;
  children?:
    | React.ReactNode
    | ((form: FormState<VS, SD, ES, WS>) => React.ReactElement | null);
}

const FormProviderRefComponent = <
  VS,
  SD = unknown,
  ES = undefined,
  WS = undefined,
>(
  props: FormProviderProps<VS, SD, ES, WS>,
  ref: React.Ref<FormState<VS, SD, ES, WS>>,
) => {
  const {values, validate, warn, onSubmit, children} = props;

  const form = useFormState(values, {
    validate,
    warn,
    onSubmit,
  });

  React.useImperativeHandle(ref, () => form, [form]);

  return (
    <formContext.Provider value={form}>
      {typeof children === 'function' ? children(form) : children}
    </formContext.Provider>
  );
};

/**
 * This React component initializes and provides a {@link FormState} instance through the React context.
 *
 * You can access the inner {@link FormState} instance with the {@link useForm} hook:
 *
 * ```jsx
 * const Child = () => {
 *   const form = useForm();
 * }
 * const Example () => {
 *   return (
 *     <FormProvider>
 *       <Child/>
 *     </FormProvider>
 *   );
 * }
 * ```
 *
 * by using a `ref`:
 *
 * ```jsx
 * const Example () => {
 *   const formRef = useRef();
 *
 *   return (
 *     <FormProvider ref={formRef}>
 *       ...
 *     </FormProvider>
 *   );
 * }
 * ```
 *
 * or by providing a render callback function as component children:
 * ```jsx
 * const Example () => {
 *   return (
 *     <FormProvider>
 *      {(form) => {
 *        ...
 *      }}
 *     </FormProvider>
 *   );
 * }
 * ```
 *
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export const FormProvider = React.forwardRef(
  FormProviderRefComponent,
) as typeof FormProviderRefComponent;
