import * as React from 'react';

import {useContext} from './useFormContext';
import {State, Interface, PathArray, Path, SetValueAction} from './useForm';
import {get, set, parsePath, formatPath, hasValue} from './util';

const normalizeError = <E extends any>(error: E): E | null =>
  hasValue(error || null) ? error : null;

export interface FieldInterface<FV, FE = null, FW = null> {
  focused: boolean;
  visited: boolean;
  touched: boolean;

  dirty: boolean;
  detached: boolean;

  value: FV;
  pendingValue: FV;
  initialValue: FV;

  error: FE | null;
  warning: FW | null;

  focus(): void;
  blur(): void;
  setValue(setValueAction: SetValueAction<FV>): void;

  acceptPendingValue(): void;
  rejectPendingValue(): void;
}

interface FieldState<FV, FE = null, FW = null> {
  focused: boolean;
  visited: boolean;
  touched: boolean;
  value: FV;
  pendingValue: FV;
  initialValue: FV;
  hasModifiedValue: boolean;
  hasPendingValue: boolean;
  error: FE | null;
  warning: FW | null;
}

const updateFieldState = <FV, FE, FW>(
  formState: State<unknown, unknown, unknown, unknown>,
  parsedPath: PathArray,
  formattedPath: string,
  compare: (value: FV, previousValue: FV) => boolean,
): ((state: Partial<FieldState<FV, FE, FW>>) => FieldState<FV, FE, FW>) => (
  state,
) => {
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
      ? (normalizeError(get(formState.errors, parsedPath)) as FE)
      : null;

  const submitError =
    formState.submitErrors !== null
      ? (normalizeError(get(formState.submitErrors, parsedPath)) as FE)
      : null;

  // TODO: Consider providing a callback to allow the consumer to merge
  // local and remove validation errors.
  const combinedError = submitError !== null ? submitError : error;

  const warning =
    formState.warnings !== null
      ? (normalizeError(get(formState.warnings, parsedPath)) as FW)
      : null;

  nextState = set(nextState, ['focused'], focused);
  nextState = set(nextState, ['visited'], visited);
  nextState = set(nextState, ['touched'], touched);

  nextState = set(nextState, ['value'], value);
  nextState = set(nextState, ['pendingValue'], pendingValue);
  nextState = set(nextState, ['pendingValue'], pendingValue);
  nextState = set(nextState, ['initialValue'], initialValue);

  nextState = set(nextState, ['hasModifiedValue'], hasModifiedValue);
  nextState = set(nextState, ['hasPendingValue'], hasPendingValue);

  nextState = set(nextState, ['error'], combinedError);
  nextState = set(nextState, ['warning'], warning);

  return nextState as FieldState<FV, FE, FW>;
};

export interface FieldConfig<FV> {
  compare?: (value: FV, previousValue: FV) => boolean;
  form?: Interface<any, any, any, any, any>;
}

const defaultConfig = {
  compare: (value: unknown, previousValue: unknown): boolean =>
    value === previousValue,
};

export const useField = <FV, FE = null, FW = null>(
  path: Path,
  {
    compare = defaultConfig.compare,
    form = useContext<unknown, unknown, unknown, unknown, unknown>(),
  }: FieldConfig<FV> = {},
): FieldInterface<FV, FE, FW> => {
  const pathRef = React.useRef(path);
  pathRef.current = path;

  const compareRef = React.useRef(compare);
  compareRef.current = compare;

  const [state, setState] = React.useState(
    (): FieldState<FV, FE, FW> =>
      updateFieldState<FV, FE, FW>(
        form.getState(),
        parsePath(pathRef.current),
        formatPath(pathRef.current),
        compareRef.current,
      )({}),
  );

  // Create a memoized update handler that can be provided to useSubscription
  // on the form interface.
  const handleFormUpdate = React.useCallback((): void => {
    setState(
      updateFieldState<FV, FE, FW>(
        form.getState(),
        parsePath(pathRef.current),
        formatPath(pathRef.current),
        compareRef.current,
      ),
    );
  }, []);

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

  const formRef = React.useRef(form);
  formRef.current = form;

  const stateRef = React.useRef(state);
  stateRef.current = state;

  // Store provided callbacks in mutable refs to enable creation of memoized
  // callbacks below.
  const focus = React.useCallback((): void => {
    formRef.current.focus(pathRef.current);
  }, []);

  const blur = React.useCallback((): void => {
    formRef.current.blur(pathRef.current);
  }, []);

  const setValue = React.useCallback(
    (setValueAction: SetValueAction<FV>): void => {
      const currentValue = stateRef.current.value;
      const nextValue =
        typeof setValueAction === 'function'
          ? (setValueAction as any)(currentValue)
          : setValueAction;

      // Avoid a pointless idempotent state change if the consumer-provided
      // compare callback considers the current and next values to be equal.
      if (!compareRef.current(currentValue, nextValue)) {
        formRef.current.setValue(pathRef.current, nextValue);
      }
    },
    [],
  );

  const acceptPendingValue = React.useCallback((): void => {
    // Avoid a pointless idempotent state change if the consumer-provided
    // compare callback considers the current and pending values to be equal.
    if (stateRef.current.hasPendingValue) {
      formRef.current.acceptPendingValue(pathRef.current);
    }
  }, []);

  const rejectPendingValue = React.useCallback((): void => {
    // Avoid a pointless idempotent state change if the consumer-provided
    // compare callback considers the current and pending values to be equal.
    if (stateRef.current.hasPendingValue) {
      formRef.current.rejectPendingValue(pathRef.current);
    }
  }, []);

  return React.useMemo((): FieldInterface<FV, FE, FW> => {
    const {
      focused,
      visited,
      touched,
      value,
      pendingValue,
      initialValue,
      hasModifiedValue,
      hasPendingValue,
      error,
      warning,
    } = stateRef.current;

    return {
      focused,
      visited,
      touched,

      dirty: hasModifiedValue,
      detached: hasPendingValue,

      value,
      pendingValue,
      initialValue,

      error,
      warning,

      focus,
      blur,
      setValue,

      acceptPendingValue,
      rejectPendingValue,
    };
  }, [stateRef.current]);
};

export interface TypedUseField<FV, FE, FW> {
  (config: FieldConfig<FV>): FieldInterface<FV, FE, FW>;
}
