// @flow strict

import * as React from 'react';

import type {
  FieldArrayProps,
  FieldArrayWrapperProps,
  FieldArrayRenderProps,
} from './types';
import {parsePath, formatPath, insert, remove, hasValue} from './util';
import {Consumer} from './context';
import Field from './Field';
import renderWrapper from './renderWrapper';

class FieldArrayWrapper extends React.PureComponent<FieldArrayWrapperProps> {
  static defaultProps: typeof FieldArrayWrapper.defaultProps;

  addField(index: number, fieldValue: mixed) {
    const {value: values, path, setValue} = this.props;

    const parsedPath = parsePath(path);

    setValue(parsedPath, insert(values, index, fieldValue));
  }

  removeField(index: number) {
    const {value: values, path, setValue} = this.props;

    const parsedPath = parsePath(path);

    setValue(parsedPath, remove(values, index));
  }

  render() {
    const {
      // Field Config
      path,
      format,
      parse,
      checkbox,

      // Field state
      initialValue: initialValues,
      value: values,
      pendingValue: pendingValues,
      error: errors,
      warning: warnings,
      submitting,

      // Context Actions
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

    if (!Array.isArray(warnings)) {
      throw new Error(`expected array warnings at ${formattedPath}`);
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
          addField={this.addField.bind(this)}
          removeField={this.removeField.bind(this)}
        >
          {renderField}
        </Field>
      );
    });

    // TODO: Calculate dirty/detached state with shallow array equality,
    // potentially with deep equality. Maybe provide a callback to allow the
    // consumer to provide a compare func?
    const hasErrors = hasValue(errors);
    const hasWarnings = hasValue(warnings);

    return children({
      fields,

      // "Meta" Props
      hasErrors,
      errors,
      hasWarnings,
      warnings,
      submitting,
      initialValues,
      rawValues: values,
      pendingValues,

      // Context Actions
      submit,

      // FieldArray Actions
      addField(value) {
        this.addField(fields.length, value);
      },
    });
  }
}

FieldArrayWrapper.defaultProps = {
  initialValue: [],
  value: [],
  pendingValue: [],
  error: [],
  warning: [],
  submitError: [],
};

class FieldArray extends React.PureComponent<FieldArrayProps> {
  static defaultProps: typeof FieldArray.defaultProps;

  render() {
    const {
      path,
      format,
      parse,
      checkbox,
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
            },
            context,
            {renderField, children, getFieldKey},
          )
        }
      </Consumer>
    );
  }
}

FieldArray.defaultProps = {
  children: ({fields}: FieldArrayRenderProps) => fields,
  getFieldKey: (stateValue: mixed, index: number) => `${index}`,
};

export default FieldArray;
