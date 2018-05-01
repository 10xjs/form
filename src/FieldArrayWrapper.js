// @flow
import * as React from 'react';

import type {FieldArrayWrapperProps, FieldArrayWrapperState} from './types';
import {
  matchesDeep,
  parsePath,
  formatPath,
  insert,
  remove,
  getId,
} from './util';
import Field from './Field';

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
  static defaultProps = {
    value: [],
  };

  state = {
    keys: this.getInitialKeys(),
  };

  getInitialKeys(): Array<string> {
    const {value, path} = this.props;

    const formattedPath = formatPath(path);

    return getValues(value, formattedPath).map(() => `${getId()}`);
  }

  addField = (index: number, fieldValue: mixed) => {
    const {value, path, setValue} = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const values = getValues(value, formattedPath);

    setValue(parsedPath, insert(values, index, fieldValue));

    this.setState((state) => {
      const keys = insert(state.keys, index, `${getId()}`);
      return {keys};
    });
  };

  removeField = (index: number) => {
    const {value, path, setValue} = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const values = getValues(value, formattedPath);

    setValue(parsedPath, remove(values, index));

    this.setState((state) => {
      const keys = remove(state.keys, index);
      return {keys};
    });
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
      value,
      pendingValue,
      error,
      submitting,

      // Context Actions
      setValue,
      setInitialValue,
      validate,

      // Render Callbacks
      children,
      renderField,
    } = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    const {keys} = this.state;

    const fields = getValues(value, formattedPath).map((_, index) => {
      const parsedFieldPath = parsedPath.concat([index]);

      return (
        <Field
          index={index}
          key={keys[index]}
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
        !/^\[object (Object|Array)\]$/.test(
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

      // FieldArray Actions
      addField(value) {
        this.addField(fields.length, value);
      },
    });
  }
}

export default FieldArrayWrapper;
