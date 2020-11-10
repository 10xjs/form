import * as React from 'react';

import {useField} from './field';

function combine<T extends React.SyntheticEvent<any>>(
  handler: React.EventHandler<T> | undefined,
  nextHandler: React.EventHandler<T>,
) {
  return (event: T) => {
    if (handler !== undefined) {
      handler(event);
      if (event.defaultPrevented) {
        return;
      }
    }

    nextHandler(event);
  };
}

/** @internal */
type RawHTMLAttributes<
  T extends keyof JSX.IntrinsicElements
> = JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<infer P, any>
  ? P
  : never;

interface FieldProps {
  path: string;
}

function create<T extends 'input' | 'select' | 'textarea'>(Component: T) {
  return (
    props: FieldProps & RawHTMLAttributes<T>,
    ref: React.Ref<React.ElementRef<T>>,
  ) => {
    const {path, ...rest} = props;

    const [data, field] = useField<string>(path);

    rest.onChange = combine<React.ChangeEvent<any>>(props.onChange, (event) => {
      field.setValue(event.target.value);
    });

    rest.onFocus = combine<React.ChangeEvent<any>>(props.onFocus, (event) => {
      field.focus();
    });

    rest.onBlur = combine<React.ChangeEvent<any>>(props.onBlur, (event) => {
      field.blur();
    });

    rest.value = data.value;
    (rest as any).ref = ref;

    return React.createElement(Component, rest);
  };
}

export const input = React.forwardRef(create('input'));
export const select = React.forwardRef(create('select'));
export const textarea = React.forwardRef(create('textarea'));
