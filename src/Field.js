// @flow strict

import * as React from 'react';

import type {FieldProps, FieldWrapperProps, InputProps} from './types';
import {
  parsePath,
  formatPath,
  parseEvent,
  mergeHandlers,
  hasValue,
} from './util';
import {Consumer} from './context';
import renderWrapper from './renderWrapper';

type HandlerProps = {
  onFocus: (mixed) => mixed,
  onBlur: (mixed) => mixed,
  onChange: (mixed) => mixed,
};

class FieldWrapper extends React.PureComponent<FieldWrapperProps> {
  render() {
    const {
      // Field Config
      path,
      format,
      parse,
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

    // TODO: Potentially calculate dirty/detached state with deep equality.
    // Maybe provide a callback to allow the consumer to provide a compare func?
    const dirty = value !== initialValue;
    const detached = value !== pendingValue;
    const hasError = hasValue(error);
    const hasWarning = hasValue(warning);

    const focus = (focused: boolean) => setFocused(formattedPath, focused);
    const visit = (visited: boolean) => setVisited(formattedPath, visited);
    const touch = (touched: boolean) => setTouched(formattedPath, touched);
    const change = (nextValue) => {
      const parsedValue = parse(nextValue, value);

      if (!detached) {
        setPendingValue(parsedPath, parsedValue);
      }

      setValue(parsedPath, parsedValue);
    };

    const input = {
      name: formattedPath,
      value: checkbox ? undefined : format(value),
      checked: checkbox ? !!format(value) : undefined,
      onFocus() {
        focus(true);
        visit(true);
      },
      onBlur() {
        focus(false);
        touch(true);
      },
      onChange(eventOrValue) {
        change(parseEvent(eventOrValue));
      },
    };

    const composeInput = <P: $Shape<HandlerProps>>(
      userProps: P,
    ): $Rest<P, $Exact<HandlerProps>> & InputProps =>
      Object.assign({}, (userProps: $Rest<P, $Exact<HandlerProps>>), input, {
        onFocus: mergeHandlers(userProps.onFocus, input.onFocus),
        onBlur: mergeHandlers(userProps.onBlur, input.onBlur),
        onChange: mergeHandlers(userProps.onChange, input.onChange),
      });

    let arrayActions;

    if (addField && removeField && typeof index === 'number') {
      arrayActions = {
        addFieldBefore(value) {
          addField(index, value);
        },
        addFieldAfter(value) {
          addField(index + 1, value);
        },
        removeField() {
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
          initialValue,
          stateValue: value,
          pendingValue,
          detached,

          // Context Actions
          setFocused: focus,
          setVisited: visit,
          setTouched: touch,
          setValue: change,
          acceptPendingValue() {
            setValue(parsedPath, pendingValue);
            setInitialValue(parsedPath, pendingValue);
          },
          rejectPendingValue() {
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
  static defaultProps: typeof Field.defaultProps;

  render() {
    const {path, format, parse, checkbox, children} = this.props;

    return (
      <Consumer>
        {(context) =>
          context !== null &&
          renderWrapper(FieldWrapper, context, {
            path,
            format,
            parse,
            checkbox,
            children,
          })
        }
      </Consumer>
    );
  }
}

Field.defaultProps = {
  format: (v: mixed) => {
    if (v === null || v === undefined) {
      return '';
    }

    return v;
  },
  parse: (v: mixed) => v,
  checkbox: false,
};

export default Field;
