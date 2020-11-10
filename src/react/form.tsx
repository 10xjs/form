import * as React from 'react';

import {useForm} from './context';

interface FormProps {
  /**
   * Called when an exception is thrown during the form submit sequence. If not
   * defined any exception is re-thrown to surface as an unhandled promise
   * rejection.
   */
  onError?: (error: any) => void;
}

/** @internal */
const FormRefComponent: React.ForwardRefRenderFunction<
  HTMLFormElement,
  FormProps & React.FormHTMLAttributes<HTMLFormElement>
> = (props, ref) => {
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

export const Form = React.forwardRef(FormRefComponent);
