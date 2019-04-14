import * as React from 'react';

import SubmitValidationError from './SubmitValidationError';

export type PathArray = (string | number)[];
export type Path = PathArray | string;

export interface FormActions {
  setValue(path: Path, value: any): void;
  setInitialValue(path: Path, value: any): void;
  setPendingValue(path: Path, value: any): void;
  setTouched(path: Path, touched: boolean): void;
  setVisited(path: Path, visited: boolean): void;
  setFocused(path: Path, focused: boolean): void;
  submit(event?: Event | React.SyntheticEvent<HTMLElement>): void;
}

export interface Context {
  initialValueState: any;
  valueState: any;
  pendingValueState: any;
  errorState: any;
  warningState: any;
  submitErrorState: any;
  focusedPath: string | null;
  touchedMap: {[key in string]: boolean};
  visitedMap: {[key in string]: boolean};
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  actions: FormActions;
}

export interface StateProviderAttributes {
  values: any;
  onSubmit(values: any): any;
  onSubmitFail(error: Error): any;
  onSubmitSuccess(response: any): any;
  onSubmitValidationFail(error: SubmitValidationError): any;
  warn(values: any): any;
  validate(values: any): any;
}

export interface StateProviderProps extends StateProviderAttributes {
  children(context: Context): React.ReactNode;
}

interface FormWrapperStateProps {
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  hasErrors: boolean;
  hasSubmitErrors: boolean;
  hasWarnings: boolean;
}

interface FormRenderProps extends FormWrapperStateProps, FormActions {}

export interface FormProps extends StateProviderAttributes {
  children(props: FormRenderProps): React.ReactNode;
}

export interface FormWrapperProps extends FormWrapperStateProps {
  actions: FormActions;
  children(props: FormRenderProps): React.ReactNode;
}

export interface HandlerProps {
  onFocus(): void;
  onBlur(): void;
  onChange(fieldValueOrEvent: any): void;
}

export interface InputProps extends HandlerProps {
  name: string;
  value: any;
  checked?: boolean;
}

export interface FieldRenderProps {
  input: InputProps;
  composeInput: <UP extends Partial<HandlerProps>>(
    userProps: UP,
  ) => UP & InputProps;

  // "Meta" Props
  path: Path;
  hasError: boolean;
  error: any;
  hasWarning: boolean;
  warning: any;
  focused: boolean;
  touched: boolean;
  visited: boolean;
  dirty: boolean;
  pristine: boolean;
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  value: any;
  pendingValue: any;
  detached: boolean;

  // Context Actions
  setFocused(focused: boolean): void;
  setVisited(visited: boolean): void;
  setTouched(touched: boolean): void;
  setValue(): void;
  acceptPendingValue(): void;
  rejectPendingValue(): void;
  submit(): void;

  // FieldArray Actions
  addFieldBefore?: (value: any) => void;
  addFieldAfter?: (value: any) => void;
  removeField?: () => void;
}

export interface FieldArrayRenderProps {
  fields: React.ReactNode[];

  // "Meta" Props
  path: Path;
  hasErrors: boolean;
  errors: any[];
  hasWarnings: boolean;
  warnings: any[];
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  values: any[];
  pendingValues: any[];
  initialValues: any[];

  // Context Actions
  submit(): void;

  // FieldArray Props
  addField(value: any): void;
}

interface FieldConfig {
  path: Path;
  format(value: any): any;
  parse(formattedValue: any, previousValue: any): any;
  compare(value: any, otherValue: any): boolean;
  checkbox: boolean;
}

export interface FieldStateProps {
  initialValue: any;
  value: any;
  pendingValue: any;
  error: any;
  warning: any;
  focused: boolean;
  touched: boolean;
  visited: boolean;
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
}

export interface FieldProps extends FieldConfig {
  key?: string;
  index?: number;
  addField?: (index: number, value: any) => void;
  removeField?: (index: number) => void;
  children(props: FieldRenderProps): React.ReactNode;
}

export interface FieldArrayProps extends FieldConfig {
  getFieldKey(stateValue: any, index: number): string;
  renderField(props: FieldRenderProps): React.ReactNode;
  children(props: FieldArrayRenderProps): React.ReactNode;
}

export interface FieldWrapperProps
  extends FieldProps,
    FieldStateProps,
    FormActions {}

export interface FieldArrayWrapperProps
  extends FieldArrayProps,
    FieldStateProps,
    FormActions {}
