import * as React from 'react';

import {
  FieldProps,
  FieldWrapperProps,
  Context,
  InputProps,
  HandlerProps,
} from './types';
import {
  parsePath,
  formatPath,
  parseEvent,
  mergeHandlers,
  hasValue,
} from './util';
import {Consumer} from './context';
import renderWrapper from './renderWrapper';

class FieldWrapper extends React.PureComponent<FieldWrapperProps> {
  public render(): React.ReactNode {
    const {
      // Field Config
      path,
      format,
      parse,
      compare,
      checkbox,

      // Field state
      initialValue,
      value,
      pendingValue,
      error,
      warning,
      focused,
      touched,
      visited,
      submitting,
      submitFailed,
      submitSucceeded,

      // Context Actions
      setFocused,
      setVisited,
      setTouched,
      setValue,
      setInitialValue,
      setPendingValue,
      submit,

      // FieldArray Props
      index,
      addField,
      removeField,

      // Render Callbacks
      children,
    } = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const dirty = !compare(value, initialValue);
    const detached = !compare(value, pendingValue);

    const hasError = hasValue(error);
    const hasWarning = hasValue(warning);

    const focus = (focused: boolean): void =>
      setFocused(formattedPath, focused);
    const visit = (visited: boolean): void =>
      setVisited(formattedPath, visited);
    const touch = (touched: boolean): void =>
      setTouched(formattedPath, touched);
    const change = (nextValue: unknown): void => {
      const parsedValue = parse(nextValue, value);

      if (!detached) {
        setPendingValue(parsedPath, parsedValue);
      }

      setValue(parsedPath, parsedValue);
    };

    const input: InputProps = {
      name: formattedPath,
      value: checkbox ? undefined : format(value),
      checked: checkbox ? !!format(value) : undefined,
      onFocus(): void {
        focus(true);
        visit(true);
      },
      onBlur(): void {
        focus(false);
        touch(true);
      },
      onChange(eventOrValue: unknown): void {
        change(parseEvent(eventOrValue));
      },
    };

    const composeInput = <UP extends Partial<HandlerProps>>(
      userProps: UP,
    ): InputProps =>
      Object.assign({}, userProps, input, {
        onFocus: mergeHandlers(userProps.onFocus, input.onFocus),
        onBlur: mergeHandlers(userProps.onBlur, input.onBlur),
        onChange: mergeHandlers(userProps.onChange, input.onChange),
      });

    let arrayActions;

    if (addField && removeField && typeof index === 'number') {
      arrayActions = {
        addFieldBefore(value: unknown): void {
          addField(index, value);
        },
        addFieldAfter(value: unknown): void {
          addField(index + 1, value);
        },
        removeField(): void {
          removeField(index);
        },
      };
    }

    return children(
      Object.assign(
        {
          // Input Tag Props
          input,
          composeInput,

          // "Meta" Props
          path: formattedPath,
          hasError,
          error,
          hasWarning,
          warning,
          focused,
          touched,
          visited,
          dirty,
          pristine: !dirty,
          submitting,
          submitFailed,
          submitSucceeded,
          initialValue,
          value,
          pendingValue,
          detached,

          // Context Actions
          setFocused: focus,
          setVisited: visit,
          setTouched: touch,
          setValue: change,
          acceptPendingValue(): void {
            setValue(parsedPath, pendingValue);
            setInitialValue(parsedPath, pendingValue);
          },
          rejectPendingValue(): void {
            setPendingValue(parsedPath, value);
            setInitialValue(parsedPath, pendingValue);
          },
          submit,

          addFieldBefore: undefined,
          addFieldAfter: undefined,
          removeField: undefined,
        },
        arrayActions,
      ),
    );
  }
}

class Field extends React.PureComponent<FieldProps> {
  public static defaultProps = {
    format: (v: unknown): unknown => {
      if (v === null || v === undefined) {
        return '';
      }

      return v;
    },
    parse: (v: unknown): unknown => v,
    compare: (value: unknown, otherValue: unknown): unknown => {
      return value === otherValue;
    },
    checkbox: false,
  };

  public render(): React.ReactNode {
    const {path, format, parse, compare, checkbox, children} = this.props;

    return (
      <Consumer>
        {(context: Context | null): React.ReactNode =>
          context !== null &&
          renderWrapper(FieldWrapper, context, {
            path,
            format,
            parse,
            compare,
            checkbox,
            children,
          })
        }
      </Consumer>
    );
  }
}

export default Field;
