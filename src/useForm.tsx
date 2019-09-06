import * as React from 'react';

import SubmitConcurrencyError from './SubmitConcurrencyError';
import SubmitValidationError from './SubmitValidationError';
import {get, set, hasValue, formatPath, parsePath} from './util';

export type PathArray = (string | number)[];
export type Path = PathArray | string;

export type Validate<V, E> = (values: V) => E;
export type Warn<V, W> = (values: V) => W;
export type OnSubmit<V, R> = (values: V) => R | Promise<R>;
export type OnSubmitFail<RR> = (error: unknown) => RR | Promise<RR>;
export type OnSubmitSuccess<R, RR> = (response: R) => RR | Promise<RR>;

export const STATUS_INITIAL = 'STATUS_INITIAL';
export const STATUS_STARTED = 'STATUS_STARTED';
export const STATUS_FAILED = 'STATUS_FAILED';
export const STATUS_ENDED = 'STATUS_ENDED';

export type SubmitStatus =
  | typeof STATUS_INITIAL
  | typeof STATUS_STARTED
  | typeof STATUS_FAILED
  | typeof STATUS_ENDED;

export interface State<V, R, E = null, W = null> {
  values: V;
  initialValues: V;
  pendingValues: V;
  errors: E | null;
  warnings: W | null;
  submitErrors: E | null;
  focusedPath: string | null;
  touchedMap: Record<string, boolean>;
  visitedMap: Record<string, boolean>;
  submitStatus: SubmitStatus;
  result?: R;
  error?: Error;
}

export type SetValueAction<FV> = FV | ((currentValue: FV) => FV);

export interface Interface<V, R, RR = R, E = null, W = null> {
  useSubscription(listener: () => void): void;
  getState(): State<V, R, E, W>;
  focus(path: Path): void;
  blur(path: Path): void;
  setValue(path: Path, setValueAction: SetValueAction<any>): void;
  acceptPendingValue(path: Path): void;
  rejectPendingValue(path: Path): void;
  submit(event?: Event | React.SyntheticEvent<HTMLElement>): Promise<RR>;
}

// Converts any value that is not considered to "have errors" to null. An object
// no matter how deep that does not contain "leaf values" (string, number, or
// boolean), while truthy, is considered to be empty. This allows the provided
// validate and warn callback to safely return a structured object or array even
// when there are no actual error values contained within.
const normalizeErrors = <E extends any>(errors: E): E | null =>
  hasValue(errors || null) ? errors : null;

type StateUpdate<V, R, E, W> = (state: State<V, R, E, W>) => State<V, R, E, W>;

// Set the visited flag for a given path. This represents that the user has
// visited but not necessarily left a field. This flag is permanent for the
// lifespan of the form.
const visit = <V, R, E, W>(path: string): StateUpdate<V, R, E, W> => (
  state,
) => {
  return set(
    state,
    (['visitedMap'] as PathArray).concat([path as string]),
    true,
  );
};

// Set the touched flag for a given path. This represents that the user has
// visited and left a field. This flag is permanent for the lifespan of the
// form.
const touch = <V, R, E, W>(path: string): StateUpdate<V, R, E, W> => (
  state,
) => {
  return set(
    state,
    (['touchedMap'] as PathArray).concat([path as string]),
    true,
  );
};

// Process a blur event for a given path. This clears the current focused path
// state and sets the touched flag for that path. In the case that the current
// focused path is not the provided path, this action applies the effects of
// an implicit focus event before applying the blur effects. This serves as
// backup in case a field has failed to fire a focus event, keeping the derived
// state consistent.
const blur = <V, R, E, W>(path: string): StateUpdate<V, R, E, W> => (state) => {
  let nextState = state;

  const focusedPath = get(nextState, ['focusedPath']);

  if (focusedPath !== path) {
    if (focusedPath !== null) {
      // Apply implicit blur side effect of previous field.
      nextState = touch<V, R, E, W>(focusedPath as string)(nextState);
    }

    // Apply implicit focus side effect of current field.
    nextState = visit<V, R, E, W>(path as string)(nextState);
  }

  nextState = set(nextState, ['focusedPath'], null);

  nextState = touch<V, R, E, W>(path)(nextState);

  return nextState;
};

// Process a focus event for a given path. This sets the current focus path to
// the provided path and sets the visited flag for that path. In the case that
// the current focused path is not null, his action applies the effects of
// an implicit blur event before applying the focus effects. This serves as
// backup in case a field has failed to fire a blur event, keeping the derived
// state consistent.
const focus = <V, R, E, W>(path: string): StateUpdate<V, R, E, W> => (
  state,
) => {
  let nextState = state;

  const focusedPath = get(nextState, ['focusedPath']);

  if (focusedPath !== null && focusedPath !== path) {
    // Apply implicit blur side effect of previous field.
    nextState = touch<V, R, E, W>(focusedPath as string)(nextState);
  }

  nextState = set(nextState, ['focusedPath'], path);

  nextState = visit<V, R, E, W>(path)(nextState);

  return nextState;
};

// Update the error state with the result of the provided validate callback.
const runValidate = <V, R, E, W>(
  validate: Validate<V, E>,
): StateUpdate<V, R, E, W> => (state) => {
  const errors = normalizeErrors(validate(state.values));

  return set(state, ['errors'], errors);
};

// Update the warning state with the result of the provided warn callback.
const runWarn = <V, R, E, W>(warn: Warn<V, W>): StateUpdate<V, R, E, W> => (
  state,
) => {
  const warnings = normalizeErrors(warn(state.values));

  return set(state, ['warnings'], warnings);
};

// Set the current value at a given path and run the provided validate and
// warn callbacks to update the error and warning state if the value change
// is not idempotent.
const setValue = <V, E, W, R, P extends PathArray, FV>(
  path: P,
  setValueAction: SetValueAction<FV>,
  validate: Validate<V, E>,
  warn: Warn<V, W>,
): StateUpdate<V, R, E, W> => (state) => {
  const currentValue = get(state, (['values'] as PathArray).concat(path));

  const nextValue: FV =
    typeof setValueAction === 'function'
      ? (setValueAction as any)(currentValue)
      : setValueAction;

  // Attempt to exit early if the value change is idempotent.
  if (currentValue === nextValue) {
    return state;
  }

  let nextState = state;

  nextState = set(nextState, (['values'] as PathArray).concat(path), nextValue);

  nextState = runValidate<V, R, E, W>(validate)(nextState);
  nextState = runWarn<V, R, E, W>(warn)(nextState);

  // Keep the pending value state in sync with value changes since it
  // is the difference between the two that signifies the existence of
  // an incoming pending value.
  // TODO: Consider of this is actually the best approach. Should a change event
  // be treated as an implicit pending value rejection? Or should the rejection
  // be explicit? Considering that a consumer can completely the presence of
  // a pending value, the implicit rejection may be unnecessary and could cause
  // issues. If removed, this behavior could be added by the consumer at the
  // field level if desired.
  if (state.values === state.pendingValues) {
    // The pending values are equal to the values in the incoming state object.
    // Therefore the updated value state is identical as well.
    nextState = set(nextState, ['pendingValues'], nextState.values);
  } else {
    nextState = set(
      nextState,
      (['pendingValues'] as PathArray).concat(path),
      nextValue,
    );
  }

  // TODO: Test field error behavior during submit and subsequent field change.

  // Any validation errors returned by the submit handler are
  // invalidated by any value change.
  nextState = set(nextState, ['submitErrors'], null);

  return nextState;
};

// This action models choosing the remote version in diff conflict and is
// designed for a scenario where the "initial" values are not static and may
// change as the result of a real-time update in a distributed system.
const acceptPending = <V, E, W, R, P extends PathArray, FV>(
  path: P,
  validate: Validate<V, E>,
  warn: Warn<V, W>,
): StateUpdate<V, R, E, W> => (state) => {
  let nextState = state;

  const pendingValue: SetValueAction<FV> = get(
    nextState,
    (['pendingValues'] as PathArray).concat(path),
  ) as any;

  nextState = setValue<V, E, W, R, P, FV>(path, pendingValue, validate, warn)(
    nextState,
  );

  return nextState;
};

// The inverse of acceptPending, this models choosing the local version in diff conflict.
const rejectPending = <V, R, E, W>(
  path: PathArray,
): StateUpdate<V, R, E, W> => (state) => {
  // "Erase" pending value by overwriting it with the current
  // field value.
  return set(
    state,
    (['pendingValues'] as PathArray).concat(path),
    get(state, (['values'] as PathArray).concat(path)),
  );
};

// Process an incoming values prop. This action update the cached initial values
// and pending values in the state - which will in turn update the derived
// detached and dirty flags returned from useField.
const updateValues = <V, R, E, W>(values: V): StateUpdate<V, R, E, W> => (
  state,
) => {
  let nextState = state;

  nextState = set(nextState, ['initialValues'], values);
  nextState = set(nextState, ['pendingValues'], values);

  return nextState;
};

// Update the state in response to a successful submit.
const setEnded = <V, R, E, W>(result: R): StateUpdate<V, R, E, W> => (
  state,
) => {
  let nextState = state;

  nextState = set(nextState, ['submitStatus'], STATUS_ENDED);
  nextState = set(nextState, ['result'], result);
  nextState = set(nextState, ['error'], null);

  return nextState;
};

// Update the state in response to a failed submit.
const setFailed = <V, R, E, W>(error: Error): StateUpdate<V, R, E, W> => (
  state,
) => {
  let nextState = state;

  if (error instanceof SubmitValidationError) {
    nextState = set(nextState, ['submitErrors'], normalizeErrors(error.errors));
  }

  nextState = set(nextState, ['submitStatus'], STATUS_FAILED);
  nextState = set(nextState, ['result'], null);
  nextState = set(nextState, ['error'], error);

  return nextState;
};

// // Update the state to indicate that a submit is in progress.
const setStarted = <V, R, E, W>(): StateUpdate<V, R, E, W> => (state) => {
  return set(state, ['submitStatus'], STATUS_STARTED);
};

export interface Config<V, R, RR = R, E = null, W = null> {
  values: V;
  warn?: Warn<V, W>;
  validate?: Validate<V, E>;
  onSubmit?: OnSubmit<V, R>;
  onSubmitFail?: OnSubmitFail<RR>;
  onSubmitSuccess?: OnSubmitSuccess<R, RR>;
}

const defaultConfig = {
  validate: (): null => null,
  warn: (): null => null,
  onSubmit: (): undefined => undefined,
  onSubmitFail: (error: unknown): Promise<undefined> => {
    // Silence validation and concurrency errors by default, these errors are
    // "safe" to silence since we know they are created by the form state
    // machine (or by the consumer) and never represent an unexpected runtime
    // exception. This is done to make the form library slightly easier to
    // work with for new consumers - but still offers consumers with more
    // complicated requirements the opportunity to override this behavior.
    if (
      error instanceof SubmitValidationError ||
      error instanceof SubmitConcurrencyError
    ) {
      return Promise.resolve(undefined);
    }

    return Promise.reject(error);
  },
  onSubmitSuccess: (): undefined => undefined,
};

const useForm = <V, R, RR = R, E = null, W = null>({
  values,
  onSubmit = defaultConfig.onSubmit as any,
  onSubmitFail = defaultConfig.onSubmitFail as any,
  onSubmitSuccess = defaultConfig.onSubmitSuccess as any,
  validate = defaultConfig.validate as any,
  warn = defaultConfig.warn as any,
}: Config<V, R, RR, E, W>): Interface<V, R, RR, E, W> => {
  // Keep track of whether this is the first hook execution - necessary for
  // defining a "componentWillReceiveProps" behavior that ignores the initial
  // render.
  const firstRun = React.useRef(true);

  // Create the state machine, synchronously applying several initial actions
  // to avoid an immediate initial re-render that would result from applying
  // these actions with setState.
  const [_state, _setState] = React.useState(
    (): State<V, R, E, W> => ({
      values,
      initialValues: values,
      pendingValues: values,
      errors: normalizeErrors(validate(values)),
      warnings: normalizeErrors(warn(values)),
      submitErrors: null,
      focusedPath: null,
      touchedMap: {},
      visitedMap: {},
      submitStatus: STATUS_INITIAL,
    }),
  );

  const setStateRef = React.useRef(_setState);
  setStateRef.current = _setState;

  const stateRef = React.useRef(_state);
  stateRef.current = _state;

  // Replace setState with a noop function when the component unmounts. This
  // mitigates "cannot call setState on an unmounted component" errors in the
  // case that a reference to any of the interface methods are held (and called)
  // beyond the life-cycle of the useState hook.
  React.useEffect(
    (): (() => void) => (): void => {
      setStateRef.current = (): void => {};
    },
    [],
  );

  // Observe updates to incoming props from which current state is derived,
  // calling any actions as necessary. These effects are ignored on first
  // render. The actions are instead applied synchronously during the state
  // initialization to avoid triggering an immediate initial re-render.
  React.useEffect((): void => {
    if (!firstRun.current) {
      setStateRef.current(updateValues(values));
    }
  }, [values]);

  React.useEffect((): void => {
    if (!firstRun.current) {
      setStateRef.current(runValidate(validate));
    }
  }, [validate]);

  React.useEffect((): void => {
    if (!firstRun.current) {
      setStateRef.current(runWarn(warn));
    }
  }, [warn]);

  const listenerArrayRef = React.useRef<(() => void)[]>([]);

  // Observe updates to state and call current listeners if necessary.
  React.useMemo((): void => {
    // Create a copy of the listeners array before executing to  avoid the
    // concern of mid-update subscription changes.
    //
    // TODO: Ensure that this can't lead to potential setState after unmount
    // errors in consumer components. A forEach iteration can apparently
    // handle array mutations safely during execution - which could prevent
    // this from being a concern in the first place.
    const currentListeners = listenerArrayRef.current.slice();

    currentListeners.forEach((listener: () => void): void => listener());
  }, [stateRef.current]);

  // Create refs for callback props to allow creation of a completely static
  // interface object with useMemo.
  // TODO: Consider storing the handlers instead in the state object. Changes
  // to validate and warn already trigger state updates - this would likely
  // not have worse performance characteristics.
  const validateRef = React.useRef(validate);
  validateRef.current = validate;

  const warnRef = React.useRef(warn);
  warnRef.current = warn;

  const onSubmitRef = React.useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const onSubmitSuccessRef = React.useRef(onSubmitSuccess);
  onSubmitSuccessRef.current = onSubmitSuccess;

  const onSubmitFailRef = React.useRef(onSubmitFail);
  onSubmitFailRef.current = onSubmitFail;

  const nextStatusRef = React.useRef<SubmitStatus>(STATUS_INITIAL);

  const formInterface = React.useMemo(
    (): Interface<V, R, RR, E, W> => ({
      // Provide a minimal pub-sub interface. The unsubscribe hook is never
      // returned directly to the consumer. Instead this takes advantage of
      // a useEffect hook to implicitly unsubscribe making this a more stable
      // interface, with the compromise that is is only available where hooks
      // can be used.
      useSubscription(listener: () => void) {
        const unsubscribe = React.useMemo(() => {
          if (listenerArrayRef.current.indexOf(listener) !== -1) {
            return function unsubscribe() {};
          }

          listenerArrayRef.current.push(listener);

          return function unsubscribe() {
            const index = listenerArrayRef.current.indexOf(listener);

            if (index !== -1) {
              listenerArrayRef.current.splice(index, 1);
            }
          };
        }, [listener]);

        React.useEffect(() => unsubscribe, [listener]);
      },

      getState() {
        return stateRef.current;
      },

      focus(path: Path) {
        setStateRef.current(focus(formatPath(path)));
      },

      blur(path: Path) {
        setStateRef.current(blur(formatPath(path)));
      },

      setValue(path: Path, setValueAction: SetValueAction<any>): void {
        setStateRef.current(
          setValue(parsePath(path), setValueAction, validate, warn),
        );
      },

      acceptPendingValue(path: Path) {
        setStateRef.current(acceptPending(parsePath(path), validate, warn));
      },

      rejectPendingValue(path: Path) {
        setStateRef.current(rejectPending(parsePath(path)));
      },

      submit(event?: Event | React.SyntheticEvent<HTMLElement>): Promise<RR> {
        // Submit may be directly used as the onSubmit callback on a form
        // element. Prevent the default form submit behavior if this is the
        // case.
        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }

        if (nextStatusRef.current === STATUS_STARTED) {
          // Abort submit if a previous submit is still in progress.
          const error = new SubmitConcurrencyError();

          // This failure case does not result in a state update. The state is
          // "owned" by the submit that is currently in progress and modifying
          // it would likely cause unexpected behavior in that submit sequence.

          // Pipe the error through the error callback, as is done for a submit
          // that fails after starting. This allows the consumer to silence
          // concurrency errors as they see necessary.

          return Promise.resolve(onSubmitFailRef.current(error));
        }

        if (stateRef.current.errors !== null) {
          // Abort submit if state contains validation errors
          const error = new SubmitValidationError(stateRef.current.errors);
          nextStatusRef.current = STATUS_FAILED;
          setStateRef.current(setFailed(error));
          return Promise.resolve(onSubmitFailRef.current(error));
        }

        const onFail = (error: Error): RR | Promise<RR> => {
          // Update form state with error thrown/rejected from onSubmit.
          nextStatusRef.current = STATUS_FAILED;
          setStateRef.current(setFailed(error));

          // Pipe the error through the error callback. This allows the consumer
          // to silence errors as they see necessary.
          return onSubmitFailRef.current(error);
        };

        const onSuccess = (result: R): RR | Promise<RR> => {
          // Update state with result returned from onSubmit.
          nextStatusRef.current = STATUS_ENDED;
          setStateRef.current(setEnded(result));

          // Pipe the result through onSubmitSuccess callback. While this
          // doesn't provide much functionality (that wasn't already possible
          // with the onSubmit callback) it does match the behavior of the error
          // callbacks which makes for a more consistent component interface.
          return onSubmitSuccessRef.current(result);
        };

        nextStatusRef.current = STATUS_STARTED;
        setStateRef.current(setStarted());

        let result: R | Promise<R>;

        // It is not yet known if onSubmit returns a promise or may throw on the
        // same tick. Attempt to call onSumbit synchronously instead of wrapping
        // it in a promise in an effort to avoid deferring callback execution
        // when possible.
        try {
          result = onSubmitRef.current(stateRef.current.values);
        } catch (error) {
          // Again, it is not known if onFail returns a promise or may throw.
          try {
            const failResult = onFail(error);
            // The onFail callback has intercepted and silenced the error.
            // Wrap its return value in a promise for a consistent return type.
            return Promise.resolve(failResult);
          } catch (error) {
            // The onFail callback did not silence the error, reject it for a
            // consistent submit return type.
            return Promise.reject(error);
          }
        }

        // Detect if the result is a promise and bind handers accordingly.
        if (result && typeof (result as Promise<R>).then === 'function') {
          // Convert result to the local Promise type (in the case that it is
          // an instance of a different Promise implementation)
          return Promise.resolve(result).then(onSuccess, onFail);
        }

        // We can only be left with a sync (non-promise) non-error result. Wrap
        // it in a promise for a consistent return type.
        return Promise.resolve(onSuccess(result as R));
      },
    }),
    [],
  );

  // Update the first run flag last - any further reference to this
  // firstRun.current within this closure would receive the incorrect value.
  React.useEffect(() => {
    firstRun.current = false;
  }, []);

  return formInterface;
};

export default useForm;

export interface TypedUseForm<V, R, RR = R, E = null, W = null> {
  (config: Config<V, R, RR, E, W>): Interface<V, R, RR, E, W>;
}
