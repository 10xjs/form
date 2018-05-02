// @flow

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
      focused,
      touched,
      visited,
      submitting,

      // Context Actions
      setFocused,
      setVisited,
      clearFocused,
      setTouched,
      setValue,
      setInitialValue,
      setPendingValue,
      validate,

      // FieldArray Props
      index,
      addField,
      removeField,

      // Render Callbacks
      children,
    } = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const props = {
      name: formattedPath,
      value: checkbox ? undefined : format(value),
      checked: checkbox ? !!format(value) : undefined,
      onFocus() {
        setFocused(formattedPath);
        setVisited(formattedPath);
      },
      onBlur() {
        clearFocused(parsedPath);
        if (validateOnBlur) {
          validate();
        }
        setTouched(parsedPath);
      },
      onChange(eventOrValue) {
        const nextValue = parseEvent(eventOrValue);

        setValue(parsedPath, parse(nextValue, value));

        if (validateOnChange) {
          validate();
        }
      },
    };

    const dirty = value !== initialValue;
    const detached = value !== pendingValue;
    const valid = matchesDeep(
      error,
      (value) =>
        !/^\[object (Object|Array|Undefined)\]$/.test(
          Object.prototype.toString.call(value),
        ),
    );

    return children({
      // Input Tag Props
      props,
      composeProps: <
        P: {
          onFocus?: (mixed) => mixed,
          onBlur?: (mixed) => mixed,
          onChange?: (mixed) => mixed,
        },
      >({
        onFocus,
        onBlur,
        onChange,
        ...rest
      }: P): $Rest<P, {|onFocus: *, onBlur: *, onChange: *|}> & InputProps => ({
        ...rest,
        ...props,
        onFocus: mergeHandlers(onFocus, props.onFocus),
        onBlur: mergeHandlers(onBlur, props.onBlur),
        onChange: mergeHandlers(onChange, props.onChange),
      }),

      // "Meta" Props
      error,
      invalid: !valid,
      valid: valid,
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
      setFocused() {
        setFocused(formattedPath);
      },
      setVisited() {
        setVisited(formattedPath);
      },
      clearFocused() {
        clearFocused(parsedPath);
        if (validateOnBlur) {
          validate();
        }
      },
      setTouched() {
        setTouched(parsedPath);
      },
      setValue(nextValue) {
        setValue(parsedPath, parse(nextValue, value));
        if (validateOnChange) {
          validate();
        }
      },
      acceptPendingValue() {
        setValue(parsedPath, pendingValue);
        setInitialValue(parsedPath, pendingValue);
      },
      rejectPendingValue() {
        setPendingValue(parsedPath, value);
        setInitialValue(parsedPath, pendingValue);
      },

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
