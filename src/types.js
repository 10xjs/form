// @flow

import * as React from 'react';

import type SubmitValidationError from './SubmitValidationError';

export type State = {[string]: mixed} | Array<mixed>;
export type ParsedPath = Array<string | number>;
export type Path = ParsedPath | string;

type ContextActions = {|
  setValue: (Path, mixed) => void,
  setInitialValue: (Path, mixed) => void,
  setPendingValue: (Path, mixed) => void,
  setError: (Path, mixed) => void,
  setTouched: (Path) => void,
  setVisited: (Path) => void,
  setFocused: (Path) => void,
  clearFocused: (Path) => void,
  validate: () => void,
  submit: (event?: Event | SyntheticEvent<>) => void,
|};

export type Context = {|
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

export type DefaultStateProviderProps<SubmitResponse> = {
  values: State,
  onSubmit(State): Promise<SubmitResponse> | SubmitResponse,
  onSubmitFail(SubmitValidationError): mixed,
  onSubmitSuccess(SubmitResponse): mixed,
  onSubmitValidationFail(Error): mixed,
  validate(State): void,
  children(context: Context): React.Node,
};

export type StateProvider<StateProviderProps> = (
  config: StateProviderProps,
  (context: Context) => React.Node,
) => React.Node;

export type FormProps<StateProviderProps> = StateProviderProps & {
  stateProvider: StateProvider<StateProviderProps>,
  children(Context): React.Node,
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
  stateValue: mixed,
  pendingValue: mixed,
  detached: boolean,

  // Context Actions
  setFocused(): void,
  setVisited(): void,
  clearFocused(): void,
  setTouched(): void,
  setValue(): void,
  acceptPendingValue(): void,
  rejectPendingValue(): void,

  // FieldArray Actions
  addFieldBefore?: (stateValue: mixed) => void,
  addFieldAfter?: (stateValue: mixed) => void,
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
  rejectPendingValue(): void,

  // FieldArray Props
  addField: (value: mixed) => void,
};

export type FieldConfig = {
  path: Path,
  format: (stateValue: mixed) => mixed,
  parse: (fieldValue: mixed, previousStateValue: mixed) => mixed,
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
  addField?: (index: number, stateValue: mixed) => void,
  removeField?: (index: number) => void,
  children(props: FieldRenderProps): React.Node,
} & FieldConfig;

export type FieldArrayProps = {
  getFieldKey(stateValue: mixed, index: number): string,
  renderField(props: FieldRenderProps): React.Node,
  children(props: FieldArrayRenderProps): React.Node,
} & FieldConfig;

export type FieldWrapperProps = FieldProps & FieldStateProps & ContextActions;

export type FieldArrayWrapperProps = FieldArrayProps &
  FieldStateProps &
  ContextActions;

export type FieldArrayWrapperState = {
  keys: Array<string>,
};
