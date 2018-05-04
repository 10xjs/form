// @flow strict

import * as React from 'react';

import type {
  FieldArrayProps,
  FieldArrayWrapperProps,
  FieldArrayRenderProps,
} from './types';
import {matchesDeep, parsePath, formatPath, insert, remove} from './util';
import {Consumer} from './context';
import Field from './Field';
import renderWrapper from './renderWrapper';

class FieldArrayWrapper extends React.PureComponent<FieldArrayWrapperProps> {
  static defaultProps = {
    initialValue: [],
    value: [],
    pendingValue: [],
    error: [],
  };

  addField = (index: number, fieldValue: mixed) => {
    const {value: values, path, setValue} = this.props;

    const parsedPath = parsePath(path);

    setValue(parsedPath, insert(values, index, fieldValue));
  };

  removeField = (index: number) => {
    const {value: values, path, setValue} = this.props;

    const parsedPath = parsePath(path);

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
      initialValue: initialValues,
      value: values,
      pendingValue: pendingValues,
      error: errors,
      warning: warnings,
      submitting,

      // Context Actions
      validate,
      submit,

      // Render Callbacks
      children,
      renderField,
      getFieldKey,
    } = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    if (!Array.isArray(values)) {
      throw new Error(`expected array value at ${formattedPath}`);
    }

    if (!Array.isArray(pendingValues)) {
      throw new Error(`expected array pendingValue at ${formattedPath}`);
    }

    if (!Array.isArray(errors)) {
      throw new Error(`expected array error at ${formattedPath}`);
    }

    const fields = values.map((value, index) => {
      const parsedFieldPath = parsedPath.concat([index]);

      return (
        <Field
          index={index}
          key={getFieldKey(value, index)}
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

    // TODO: Calculate dirty/detached state with shallow array equality,
    // potentially with deep equality. Maybe provide a callback to allow the
    // consumer to provide a compare func?
    const valid = matchesDeep(
      errors,
      (value) =>
        !/^\[object (Object|Array|Undefined)\]$/.test(
          Object.prototype.toString.call(value),
        ),
    );
    const hasWarning = matchesDeep(
      warnings,
      (value) =>
        !/^\[object (Object|Array|Undefined)\]$/.test(
          Object.prototype.toString.call(value),
        ),
    );

    return children({
      fields,

      // "Meta" Props
      errors,
      invalid: !valid,
      valid: valid,
      warnings,
      hasWarning,
      submitting,
      initialValues,
      rawValues: values,
      pendingValues,

      // Context Actions
      validate,
      submit,

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
