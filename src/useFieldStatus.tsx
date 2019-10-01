import * as React from 'react';

import {useContext} from './useFormContext';
import {State, Interface, PathArray, Path} from './useForm';
import {get, set, parsePath, formatPath, hasValue} from './util';

const normalizeError = <E extends any>(error: E): E | null =>
  hasValue(error || null) ? error : null;

export interface FieldStatus {
  focused: boolean;
  visited: boolean;
  touched: boolean;

  dirty: boolean;
  detached: boolean;

  hasError: boolean;
  hasWarning: boolean;
}

export const updateFieldStatus = <FV extends any>(
  formState: State<unknown, unknown, unknown, unknown>,
  parsedPath: PathArray,
  formattedPath: string,
  compare: (value: FV, previousValue: FV) => boolean,
): ((state: Partial<FieldStatus>) => FieldStatus) => (state) => {
  let nextState = state;

  const focused = formState.focusedPath === formattedPath;
  const visited = !!get(formState.visitedMap, [formattedPath]);
  const touched = !!get(formState.touchedMap, [formattedPath]);

  const value = get(formState.values, parsedPath) as FV;
  const pendingValue = get(formState.pendingValues, parsedPath) as FV;
  const initialValue = get(formState.initialValues, parsedPath) as FV;

  const hasModifiedValue = !compare(initialValue, value);
  const hasPendingValue = !compare(value, pendingValue);

  const error =
    formState.errors !== null
      ? normalizeError(get(formState.errors, parsedPath))
      : null;

  const submitError =
    formState.submitErrors !== null
      ? normalizeError(get(formState.submitErrors, parsedPath))
      : null;

  // TODO: Consider providing a callback to allow the consumer to merge
  // local and remove validation errors.
  const combinedError = submitError !== null ? submitError : error;

  const hasError = combinedError !== null;

  const hasWarning =
    formState.warnings === null
      ? false
      : normalizeError(get(formState.warnings, parsedPath)) !== null;

  nextState = set(nextState, ['focused'], focused);
  nextState = set(nextState, ['visited'], visited);
  nextState = set(nextState, ['touched'], touched);

  nextState = set(nextState, ['hasModifiedValue'], hasModifiedValue);
  nextState = set(nextState, ['hasPendingValue'], hasPendingValue);
  nextState = set(nextState, ['hasError'], hasError);
  nextState = set(nextState, ['hasWarning'], hasWarning);

  return nextState as FieldStatus;
};

export interface FieldStatusConfig<FV> {
  compare?: (value: FV, previousValue: FV) => boolean;
  form?: Interface<any, any, any, any, any>;
}

const defaultConfig = {
  compare: (value: unknown, previousValue: unknown): boolean =>
    value === previousValue,
};

export const useFieldStatus = <FV extends any>(
  path: Path,
  {
    compare = defaultConfig.compare,
    form = useContext<unknown, unknown, unknown, unknown, unknown>(),
  }: FieldStatusConfig<FV> = {},
): FieldStatus => {
  const pathRef = React.useRef(path);
  pathRef.current = path;

  const compareRef = React.useRef(compare);
  compareRef.current = compare;

  const [fieldStatus, setFieldStatus] = React.useState(
    (): FieldStatus =>
      updateFieldStatus<FV>(
        form.getState(),
        parsePath(pathRef.current),
        formatPath(pathRef.current),
        compareRef.current,
      )({}),
  );

  // Create a memoized update handler that can be provided to useSubscription
  // on the form interface.
  const handleFormUpdate = React.useCallback((): void => {
    setFieldStatus(
      updateFieldStatus<FV>(
        form.getState(),
        parsePath(pathRef.current),
        formatPath(pathRef.current),
        compareRef.current,
      ),
    );
  }, [form]);

  form.useSubscription(handleFormUpdate);

  // Detect any changes in the provided form interface and update local state
  // accordingly.
  const previousFormRef = React.useRef(form);
  React.useEffect((): void => {
    if (previousFormRef.current !== form) {
      previousFormRef.current = form;
      // The next form interface is different from the current form interface.
      handleFormUpdate();
    }
  }, [form]);

  return fieldStatus;
};

export interface TypedUseFieldStatus<FV> {
  (config: FieldStatusConfig<FV>): FieldStatus;
}
