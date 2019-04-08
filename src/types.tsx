import * as React from 'react';

import SubmitValidationError from './SubmitValidationError';

export type PathArray = (string | number)[];
export type Path = PathArray | string;

export interface FormActions {
  setValue(path: Path, value: unknown): void;
  setInitialValue(path: Path, value: unknown): void;
  setPendingValue(path: Path, value: unknown): void;
  setTouched(path: Path, touched: boolean): void;
  setVisited(path: Path, visited: boolean): void;
  setFocused(path: Path, focused: boolean): void;
  submit(event?: Event | React.SyntheticEvent<HTMLElement>): void;
}

export interface Context {
  initialValueState: unknown;
  valueState: unknown;
  pendingValueState: unknown;
  errorState: unknown;
  warningState: unknown;
  submitErrorState: unknown;
  focusedPath: string | null;
  touchedMap: {[key in string]: boolean};
  visitedMap: {[key in string]: boolean};
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  actions: FormActions;
}

export interface DefaultStateProviderProps {
  values: unknown;
  onSubmit(values: unknown): unknown;
  onSubmitFail(error: Error): unknown;
  onSubmitSuccess(response: unknown): unknown;
  onSubmitValidationFail(error: SubmitValidationError): unknown;
  warn(values: unknown): unknown;
  validate(values: unknown): unknown;
  children(context: Context): React.ReactNode;
}

// P: StateProivder props
type StateProvider<P> = (
  config: P,
  render: (context: Context) => React.ReactNode,
) => React.ReactNode;

interface FormWrapperStateProps {
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  hasErrors: boolean;
  hasSubmitErrors: boolean;
  hasWarnings: boolean;
}

interface FormRenderProps extends FormWrapperStateProps, FormActions {}

// P: StateProivder props
export type FormProps<P> = P & {
  stateProvider: StateProvider<P>;
  children(props: FormRenderProps): React.ReactNode;
};

export interface FormWrapperProps extends FormWrapperStateProps {
  actions: FormActions;
  children(props: FormRenderProps): React.ReactNode;
}

export interface HandlerProps {
  onFocus(): void;
  onBlur(): void;
  onChange(fieldValueOrEvent: unknown): void;
}

export interface InputProps extends HandlerProps {
  name: string;
  value: unknown;
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
  error: unknown;
  hasWarning: boolean;
  warning: unknown;
  focused: boolean;
  touched: boolean;
  visited: boolean;
  dirty: boolean;
  pristine: boolean;
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  value: unknown;
  pendingValue: unknown;
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
  addFieldBefore?: (value: unknown) => void;
  addFieldAfter?: (value: unknown) => void;
  removeField?: () => void;
}

export interface FieldArrayRenderProps {
  fields: React.ReactNode[];

  // "Meta" Props
  path: Path;
  hasErrors: boolean;
  errors: unknown[];
  hasWarnings: boolean;
  warnings: unknown[];
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  values: unknown[];
  pendingValues: unknown[];
  initialValues: unknown[];

  // Context Actions
  submit(): void;

  // FieldArray Props
  addField(value: unknown): void;
}

interface FieldConfig {
  path: Path;
  format(value: unknown): unknown;
  parse(formattedValue: unknown, previousValue: unknown): unknown;
  compare(value: unknown, otherValue: unknown): boolean;
  checkbox: boolean;
}

export interface FieldStateProps {
  initialValue: unknown;
  value: unknown;
  pendingValue: unknown;
  error: unknown;
  warning: unknown;
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
  addField?: (index: number, value: unknown) => void;
  removeField?: (index: number) => void;
  children(props: FieldRenderProps): React.ReactNode;
}

export interface FieldArrayProps extends FieldConfig {
  getFieldKey(stateValue: unknown, index: number): string;
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
