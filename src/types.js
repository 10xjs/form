// @flow strict

import * as React from 'react';

import type SubmitValidationError from './SubmitValidationError';

export type State = {[string]: mixed};
export type PathArray = Array<string | number>;
export type Path = PathArray | string;

export interface FormActions {
  setValue(path: Path, value: mixed): void;
  setInitialValue(path: Path, value: mixed): void;
  setPendingValue(path: Path, value: mixed): void;
  setTouched(path: Path, touched: boolean): void;
  setVisited(path: Path, visited: boolean): void;
  setFocused(path: Path, focused: boolean): void;
  submit(event?: Event | SyntheticEvent<>): void;
}

export type Context = {
  initialValueState: State,
  valueState: State,
  pendingValueState: State,
  errorState: State | null,
  warningState: State | null,
  submitErrorState: State | null,
  focusedPath: string | null,
  touchedMap: {[string]: boolean},
  visitedMap: {[string]: boolean},
  submitting: boolean,
  submitFailed: boolean,
  submitSucceeded: boolean,
  actions: FormActions,
};

export type DefaultStateProviderProps<SubmitResponse> = {
  values: State,
  onSubmit(values: State): Promise<SubmitResponse> | SubmitResponse,
  onSubmitFail(error: Error): mixed,
  onSubmitSuccess(response: SubmitResponse): mixed,
  onSubmitValidationFail(error: SubmitValidationError): mixed,
  warn(values: State): State | null,
  validate(values: State): State | null,
  children(context: Context): React.Node,
};

export type StateProvider<StateProviderProps> = (
  config: StateProviderProps,
  (context: Context) => React.Node,
) => React.Node;

type FormWrapperStateProps = {
  submitting: boolean,
  submitFailed: boolean,
  submitSucceeded: boolean,
  hasErrors: boolean,
  hasSubmitErrors: boolean,
  hasWarnings: boolean,
};

export type FormRenderProps = FormWrapperStateProps & FormActions;

export type FormProps<StateProviderProps> = StateProviderProps & {
  stateProvider: StateProvider<StateProviderProps>,
  children(props: FormRenderProps): React.Node,
};

export type FormWrapperProps = FormWrapperStateProps & {
  actions: FormActions,
  children(props: FormRenderProps): React.Node,
};

export type InputProps = {
  name: string,
  value: mixed,
  checked?: boolean,
  onFocus(): void,
  onBlur(): void,
  onChange(fieldValueOrEvent: mixed): void,
};

export type FieldRenderProps = {
  input: InputProps,
  composeInput: <
    P: {
      onFocus?: () => mixed,
      onBlur?: () => mixed,
      onChange?: () => mixed,
    },
  >(
    P,
  ) => $Rest<P, {|onFocus: *, onBlur: *, onChange: *|}> & InputProps,

  // "Meta" Props
  hasError: boolean,
  error: mixed,
  hasWarning: boolean,
  warning: mixed,
  focused: boolean,
  touched: boolean,
  visited: boolean,
  dirty: boolean,
  pristine: boolean,
  submitting: boolean,
  stateValue: mixed,
  pendingValue: mixed,
  detached: boolean,

  // Context Actions
  setFocused(focused: boolean): void,
  setVisited(visited: boolean): void,
  setTouched(touched: boolean): void,
  setValue(): void,
  acceptPendingValue(): void,
  rejectPendingValue(): void,
  submit(): void,

  // FieldArray Actions
  addFieldBefore?: (stateValue: mixed) => void,
  addFieldAfter?: (stateValue: mixed) => void,
  removeField?: () => void,
};

export type FieldArrayRenderProps = {
  fields: Array<React.Node>,

  // "Meta" Props
  errors: Array<mixed>,
  hasErrors: boolean,
  hasWarnings: boolean,
  warnings: Array<mixed>,
  submitting: boolean,
  rawValues: Array<mixed>,
  pendingValues: Array<mixed>,

  // Context Actions
  submit(): void,

  // FieldArray Props
  addField(value: mixed): void,
};

export type FieldConfig = {
  path: Path,
  format(stateValue: mixed): mixed,
  parse(fieldValue: mixed, previousStateValue: mixed): mixed,
  checkbox: boolean,
};

type FieldStateProps<T> = {
  initialValue: T,
  value: T,
  pendingValue: T,
  error: T,
  submitError: T,
  warning: T,
  focused: boolean,
  touched: boolean,
  visited: boolean,
  submitting: boolean,
};

export type FieldProps = {
  key?: string,
  index?: number,
  addField?: (index: number, stateValue: mixed) => void,
  removeField?: (index: number) => void,
  children(props: FieldRenderProps): React.Node,
} & FieldConfig;

export type FieldArrayProps = {
  getFieldKey(stateValue: mixed, index: number): string,
  renderField(props: FieldRenderProps): React.Node,
  children(props: FieldArrayRenderProps): React.Node,
} & FieldConfig;

export type FieldWrapperProps = FieldProps &
  FieldStateProps<mixed> &
  FormActions;

export type FieldArrayWrapperProps = FieldArrayProps &
  FieldStateProps<Array<mixed>> &
  FormActions;
