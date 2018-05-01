// @flow

import * as React from 'react';

import type SubmitValidationError from './SubmitValidationError';

export type State = {[string]: mixed} | Array<mixed>;
export type ParsedPath = Array<string | number>;
export type Path = ParsedPath | string;

type ContextActions = {|
  setValue: (Path, mixed) => void,
  setInitialValue: (Path, mixed) => void,
  setError: (Path, mixed) => void,
  setTouched: (Path) => void,
  setVisited: (Path) => void,
  setFocused: (Path) => void,
  clearFocused: (Path) => void,
  validate: () => void,
  submit: (event?: Event | SyntheticEvent<>) => void,
|};

export type FormState = {|
  initialValueState: State,
  valueState: State,
  pendingValueState: State,
  errorState: State,
  submitErrorState: State,
  focusedPath: string | null,
  touchedMap: {[string]: boolean},
  visitedMap: {[string]: boolean},
  submitting: boolean,
  submitFailed: boolean,
  submitSucceeded: boolean,
  validationStale: boolean,
  valid: boolean,
  actions: ContextActions,
|};

export type FormProps<T> = {
  values: State,
  onSubmit: (State) => Promise<T> | T,
  onSubmitFail: (Error) => mixed,
  onSubmitSuccess: (T) => mixed,
  onSubmitValidationFail: (SubmitValidationError) => mixed,
  validate: (State) => ?State,
  children(FormState): React.Node,
};

export type InputProps = {
  name: string,
  value: mixed,
  checked?: boolean,
  onFocus(): void,
  onBlur(): void,
  onChange(mixed): void,
};

export type FieldRenderProps = {
  props: InputProps,
  composeProps: <
    P: {
      onFocus?: () => mixed,
      onBlur?: () => mixed,
      onChange?: () => mixed,
    },
  >(
    P,
  ) => $Rest<P, {|onFocus: *, onBlur: *, onChange: *|}> & InputProps,

  // "Meta" Props
  error: mixed,
  invalid: boolean,
  valid: boolean,
  focused: boolean,
  touched: boolean,
  visited: boolean,
  dirty: boolean,
  pristine: boolean,
  submitting: boolean,
  rawValue: mixed,
  pendingValue: mixed,
  detached: boolean,

  // Context Actions
  setFocused(): void,
  setVisited(): void,
  clearFocused(): void,
  setTouched(): void,
  setValue(): void,
  acceptPendingValue(): void,

  // FieldArray Actions
  addFieldBefore?: (mixed) => void,
  addFieldAfter?: (mixed) => void,
  removeField?: () => void,
};

export type FieldArrayRenderProps = {
  fields: Array<React.Node>,

  // "Meta" Props
  error: mixed,
  invalid: boolean,
  valid: boolean,
  dirty: boolean,
  pristine: boolean,
  submitting: boolean,
  rawValue: mixed,
  pendingValue: mixed,
  detached: boolean,

  // Context Actions
  setValue(): void,
  acceptPendingValue(): void,

  // FieldArray Props
  addField: (mixed) => void,
};

export type FieldConfig = {
  path: Path,
  format: (mixed) => mixed,
  parse: (mixed, mixed) => mixed,
  checkbox: boolean,
  validateOnBlur: boolean,
  validateOnChange: boolean,
};

type FieldStateProps = {
  initialValue: mixed,
  value: mixed,
  pendingValue: mixed,
  error: mixed,
  focused: boolean,
  touched: boolean,
  visited: boolean,
  submitting: boolean,
};

export type FieldProps = {
  key?: string,
  index?: number,
  addField?: (number, mixed) => void,
  removeField?: (number) => void,
  children(FieldRenderProps): React.Node,
} & FieldConfig;

export type FieldArrayProps = {
  renderField(FieldRenderProps): React.Node,
  children(FieldArrayRenderProps): React.Node,
} & FieldConfig;

export type FieldWrapperProps = FieldProps & FieldStateProps & ContextActions;

export type FieldArrayWrapperProps = FieldArrayProps &
  FieldStateProps &
  ContextActions;

export type FieldArrayWrapperState = {
  keys: Array<string>,
};
