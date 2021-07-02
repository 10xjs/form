import * as React from 'react';

import {useForm} from './context';

export interface FormProps extends React.ComponentPropsWithoutRef<'form'> {
  /**
   * Called when an exception is thrown during the form submit sequence. If not
   * defined any exception is re-thrown to surface as an unhandled promise
   * rejection.
   */
  onError?: (error: any) => void;
}

const FormRefComponent = (
  props: FormProps,
  ref: React.Ref<HTMLFormElement>,
) => {
  const form = useForm();

  const onErrorRef = React.useRef(props.onError);
  onErrorRef.current = props.onError;

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.submit().catch((error) => {
        if (onErrorRef.current !== undefined) {
          onErrorRef.current(error);
        } else {
          throw error;
        }
      });
    },
    [form],
  );

  return <form ref={ref} {...props} onSubmit={handleSubmit} />;
};

/**
 * This React component renders an HTML `form` element with an `onSubmit` handler bound to the current `FormProvider` context.
 *
 * Using `Form` is not a requirement if you prefer to trigger {@link FormState.submit} programmatically.
 *
 * `Form` offers an {@link FormProps.onError | onError} handler prop to intercept errors thrown from calls it makes to {@link FormState.submit} internally.
 *
 * The following examples are functionally equivalent:
 *
 * ```jsx
 * const Example () => {
 *   return (
 *     <FormProvider>
 *       <Form
 *         onError={(error) => {
 *           console.log('error');
 *           throw error;
 *         }}
 *       >
 *         ...
 *       </Form>
 *     </FormProvider>
 *   );
 * }
 * ```
 *
 * ```jsx
 * const Example () => {
 *   const formRef = useRef();
 *
 *   return (
 *     <FormProvider ref={formRef}>
 *       <form
 *         onSubmit={(event) => {
 *           event.preventDefault();
 *           formRef.current?.submit().catch((error) => {
 *             console.log('error');
 *             throw error;
 *           });
 *         }}
 *       >
 *         ...
 *       </form>
 *     </FormProvider>
 *   );
 * }
 * ```
 */
export const Form = React.forwardRef(
  FormRefComponent,
) as typeof FormRefComponent;
