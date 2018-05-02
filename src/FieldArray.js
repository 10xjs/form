// @flow

import * as React from 'react';

import type {
  FieldArrayProps,
  FieldArrayWrapperProps,
  FieldArrayWrapperState,
  FieldArrayRenderProps,
} from './types';
import {matchesDeep, parsePath, formatPath, insert, remove} from './util';
import {Consumer} from './context';
import Field from './Field';
import renderWrapper from './renderWrapper';

const getValues = (value: mixed, formattedPath: string): Array<mixed> => {
  if (!Array.isArray(value)) {
    throw new Error(`expected array at ${formattedPath}`);
  }

  return value;
};

class FieldArrayWrapper extends React.PureComponent<
  FieldArrayWrapperProps,
  FieldArrayWrapperState,
> {
  addField = (index: number, fieldValue: mixed) => {
    const {value = [], path, setValue} = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const values = getValues(value, formattedPath);

    setValue(parsedPath, insert(values, index, fieldValue));
  };

  removeField = (index: number) => {
    const {value = [], path, setValue} = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const values = getValues(value, formattedPath);

    setValue(parsedPath, remove(values, index));
  };

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
      value = [],
      pendingValue,
      error,
      submitting,

      // Context Actions
      setValue,
      setInitialValue,
      setPendingValue,
      validate,

      // Render Callbacks
      children,
      renderField,
      getFieldKey,
    } = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const fields = getValues(value, formattedPath).map((fieldValue, index) => {
      const parsedFieldPath = parsedPath.concat([index]);

      return (
        <Field
          index={index}
          key={getFieldKey(fieldValue, index)}
          path={parsedFieldPath}
          format={format}
          parse={parse}
          checkbox={checkbox}
          validateOnBlur={validateOnBlur}
          validateOnChange={validateOnChange}
          addField={this.addField}
          removeField={this.removeField}
        >
          {renderField}
        </Field>
      );
    });

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
      fields,
      // "Meta" Props
      error,
      invalid: !valid,
      valid: valid,
      dirty,
      pristine: !dirty,
      submitting,
      initialValue,
      rawValue: value,
      pendingValue,
      detached,

      // Context Actions
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
      addField(value) {
        this.addField(fields.length, value);
      },
    });
  }
}

class FieldArray extends React.PureComponent<FieldArrayProps> {
  static defaultProps = {
    children: ({fields}: FieldArrayRenderProps) => fields,
    getFieldKey: (stateValue: mixed, index: number) => `${index}`,
  };

  render() {
    const {
      path,
      format,
      parse,
      checkbox,
      validateOnBlur,
      validateOnChange,
      renderField,
      children,
      getFieldKey,
    } = this.props;

    return (
      <Consumer>
        {(context) =>
          context !== null &&
          renderWrapper(
            FieldArrayWrapper,
            {
              path,
              format,
              parse,
              checkbox,
              validateOnBlur,
              validateOnChange,
            },
            context,
            {renderField, children, getFieldKey},
          )
        }
      </Consumer>
    );
  }
}

export default FieldArray;
