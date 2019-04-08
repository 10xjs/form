import * as React from 'react';

import {
  FieldArrayProps,
  FieldArrayWrapperProps,
  FieldArrayRenderProps,
  Context,
} from './types';
import {parsePath, formatPath, insert, remove, hasValue} from './util';
import {Consumer} from './context';
import Field from './Field';
import renderWrapper from './renderWrapper';

class FieldArrayWrapper extends React.PureComponent<FieldArrayWrapperProps> {
  public static defaultProps = {
    initialValue: [],
    value: [],
    pendingValue: [],
    error: [],
    warning: [],
    submitError: [],
  };

  public addField(index: number, fieldValue: unknown): void {
    const {value: values, path, setValue} = this.props;

    const parsedPath = parsePath(path);

    if (Array.isArray(values)) {
      setValue(parsedPath, insert(values, index, fieldValue));
    }
  }

  public removeField(index: number): void {
    const {value: values, path, setValue} = this.props;

    const parsedPath = parsePath(path);

    if (Array.isArray(values)) {
      setValue(parsedPath, remove(values, index));
    }
  }

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
      submitting,
      submitFailed,
      submitSucceeded,

      // Context Actions
      submit,

      // Render Callbacks
      children,
      renderField,
      getFieldKey,
    } = this.props;

    const parsedPath = parsePath(path);
    const formattedPath = formatPath(path);

    if (!Array.isArray(value)) {
      throw new Error(`expected array value at ${formattedPath}`);
    }

    const values: unknown[] = value;

    if (!Array.isArray(pendingValue)) {
      throw new Error(`expected array pendingValue at ${formattedPath}`);
    }

    const pendingValues: unknown[] = pendingValue;

    if (!Array.isArray(warning)) {
      throw new Error(`expected array warnings at ${formattedPath}`);
    }

    const warnings: unknown[] = warning;

    if (!Array.isArray(error)) {
      throw new Error(`expected array error at ${formattedPath}`);
    }

    const errors: unknown[] = error;

    if (!Array.isArray(initialValue)) {
      throw new Error(`expected array error at ${formattedPath}`);
    }

    const initialValues: unknown[] = initialValue;

    const fields: React.ReactElement<typeof Field>[] = values.map(
      (value: unknown, index: number): React.ReactElement<typeof Field> => {
        const parsedFieldPath = parsedPath.concat([index]);

        return (
          <Field
            index={index}
            key={getFieldKey(value, index)}
            path={parsedFieldPath}
            format={format}
            parse={parse}
            compare={compare}
            checkbox={checkbox}
            addField={this.addField.bind(this)}
            removeField={this.removeField.bind(this)}
          >
            {renderField}
          </Field>
        );
      },
    );

    // TODO: Calculate dirty/detached state with shallow array equality,
    // potentially with deep equality. Maybe provide a callback to allow the
    // consumer to provide a compare func?
    const hasErrors = hasValue(errors);
    const hasWarnings = hasValue(warnings);

    const self = this;

    return children({
      fields,

      // "Meta" Props
      path: formattedPath,
      hasErrors,
      errors,
      hasWarnings,
      warnings,
      submitting,
      submitFailed,
      submitSucceeded,
      initialValues,
      values,
      pendingValues,

      // Context Actions
      submit,

      // FieldArray Actions
      addField(value: unknown): void {
        self.addField(fields.length, value);
      },
    });
  }
}

class FieldArray extends React.PureComponent<FieldArrayProps> {
  public static defaultProps = {
    children: ({fields}: FieldArrayRenderProps): React.ReactNode => fields,
    getFieldKey: (stateValue: unknown, index: number): string => `${index}`,
  };

  public render(): React.ReactElement<typeof Consumer> {
    const {
      path,
      format,
      parse,
      compare,
      checkbox,
      renderField,
      children,
      getFieldKey,
    } = this.props;

    return (
      <Consumer>
        {(context: Context | null): React.ReactNode =>
          context !== null &&
          renderWrapper(FieldArrayWrapper, context, {
            path,
            format,
            parse,
            compare,
            checkbox,
            renderField,
            children,
            getFieldKey,
          })
        }
      </Consumer>
    );
  }
}

export default FieldArray;
