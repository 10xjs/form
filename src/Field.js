// @flow strict

import * as React from 'react';

import type {FieldProps, FieldWrapperProps, InputProps} from './types';
import {
  matchesDeep,
  parsePath,
  formatPath,
  parseEvent,
  mergeHandlers,
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
      validateOnBlur,
      validateOnChange,

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
      validate,
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
    const hasError = matchesDeep(
      error,
      (value) =>
        !/^\[object (Object|Array|Undefined)\]$/.test(
          Object.prototype.toString.call(value),
        ),
    );
    const hasWarning = matchesDeep(
      warning,
      (value) =>
        !/^\[object (Object|Array|Undefined)\]$/.test(
          Object.prototype.toString.call(value),
        ),
    );

    const focus = (focused: boolean) => setFocused(formattedPath, focused);
    const visit = (visited: boolean) => setVisited(formattedPath, visited);
    const touch = (touched: boolean) => setTouched(formattedPath, touched);
    const change = (nextValue) => {
      const parsedValue = parse(nextValue, value);

      setValue(parsedPath, parsedValue);

      if (!detached) {
        setPendingValue(parsedPath, parsedValue);
      }

      if (validateOnChange) {
        validate();
      }
    };

    const props = {
      name: formattedPath,
      value: checkbox ? undefined : format(value),
      checked: checkbox ? !!format(value) : undefined,
      onFocus() {
        focus(true);
        visit(true);
      },
      onBlur() {
        focus(false);
        if (validateOnBlur) {
          validate();
        }
        touch(true);
      },
      onChange(eventOrValue) {
        change(parseEvent(eventOrValue));
      },
    };

    const composeProps = <P: $Shape<HandlerProps>>({
      onFocus,
      onBlur,
      onChange,
      ...rest
    }: P): $Rest<P, $Exact<HandlerProps>> & InputProps => ({
      ...rest,
      ...props,
      onFocus: mergeHandlers(onFocus, props.onFocus),
      onBlur: mergeHandlers(onBlur, props.onBlur),
      onChange: mergeHandlers(onChange, props.onChange),
    });

    return children({
      // Input Tag Props
      props,
      composeProps,

      // "Meta" Props
      error,
      invalid: hasError,
      valid: !hasError,
      warning,
      hasWarning,
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
      validate,
      submit,

      // FieldArray Actions
      ...(addField && removeField && typeof index === 'number'
        ? {
            addFieldBefore(value) {
              addField(index, value);
            },
            addFieldAfter(value) {
              addField(index + 1, value);
            },
            removeField() {
              removeField(index);
            },
          }
        : null),
    });
  }
}

class Field extends React.PureComponent<FieldProps> {
  static defaultProps = {
    format: (v: mixed) => {
      if (v === null || v === undefined) {
        return '';
      }

      return v;
    },
    parse: (v: mixed) => v,
    checkbox: false,
    validateOnBlur: true,
    validateOnChange: false,
  };

  render() {
    const {
      path,
      format,
      parse,
      checkbox,
      validateOnBlur,
      validateOnChange,
      children,
    } = this.props;

    return (
      <Consumer>
        {(context) =>
          context !== null &&
          renderWrapper(
            FieldWrapper,
            {
              path,
              format,
              parse,
              checkbox,
              validateOnBlur,
              validateOnChange,
            },
            context,
            {children},
          )
        }
      </Consumer>
    );
  }
}

export default Field;
