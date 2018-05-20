// @flow strict

import * as React from 'react';

import type {
  DefaultStateProviderProps,
  Context,
  PathArray,
  Path,
} from './types';

import {
  set,
  setWith,
  parsePath,
  formatPath,
  emptyPathArrayError,
  emptyPathStringError,
  hasValue,
} from './util';
import SubmitValidationError from './SubmitValidationError';

type Props<T> = DefaultStateProviderProps<T>;
type State = Context;

const safeSet = (state: Context, path: PathArray, value: mixed) => {
  let nextState = state;

  const baseIsNull = nextState[path[0]] === null;

  const tempState = baseIsNull ? set(nextState, [path[0]], {}) : nextState;

  nextState = set(tempState, path, value);

  if (nextState === tempState) {
    return state;
  }

  return nextState;
};

const updateWarningState = (state: State) => {
  let nextState = state;

  if (!hasValue(nextState.warningState)) {
    nextState = set(nextState, ['warningState'], null);
  }

  return nextState;
};

const updateErrorState = (state: State) => {
  let nextState = state;

  if (!hasValue(nextState.errorState)) {
    nextState = set(nextState, ['errorState'], null);
  }

  return nextState;
};

const updateSubmitErrorState = (state: State) => {
  let nextState = state;

  if (!hasValue(nextState.submitErrorState)) {
    nextState = set(nextState, ['submitErrorState'], null);
  }

  return nextState;
};

const updateValue = (path: PathArray, value: mixed) => (state: State) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = set(nextState, ['valueState'].concat(path), value);

  if (nextState === state) {
    return null;
  }

  nextState = set(nextState, ['warningStale'], true);
  nextState = set(nextState, ['validationStale'], true);

  // Clear warning state at path.
  if (nextState.warningState !== null) {
    nextState = set(nextState, ['warningState'].concat(path), undefined);

    if (nextState.warningState !== state.warningState) {
      nextState = updateWarningState(nextState);
    }
  }

  // Clear error state at path.
  if (nextState.errorState !== null) {
    nextState = set(nextState, ['errorState'].concat(path), undefined);

    if (nextState.errorState !== state.errorState) {
      nextState = updateErrorState(nextState);
    }
  }

  // Clear submit error state at path.
  if (nextState.submitErrorState !== null) {
    nextState = set(nextState, ['submitErrorState'].concat(path), undefined);

    if (nextState.submitErrorState !== state.submitErrorState) {
      nextState = updateSubmitErrorState(nextState);
    }
  }

  return nextState;
};

const updateInitialValue = (path: PathArray, value: mixed) => (
  state: State,
) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = set(nextState, ['initialValueState'].concat(path), value);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updatePendingValue = (path: PathArray, value: mixed) => (
  state: State,
) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = set(nextState, ['pendingValueState'].concat(path), value);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateWarning = (path: PathArray, warning: mixed) => (state: State) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = safeSet(nextState, ['warningState'].concat(path), warning);

  if (nextState === state) {
    return null;
  }

  nextState = set(nextState, ['warningStale'], true);
  nextState = updateWarningState(nextState);

  return nextState;
};

const updateError = (path: PathArray, error: mixed) => (state: State) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = safeSet(nextState, ['errorState'].concat(path), error);

  if (nextState !== state) {
    nextState = set(nextState, ['validationStale'], true);
    nextState = updateErrorState(nextState);
  }

  const reference = nextState;

  nextState = safeSet(nextState, ['submitErrorState'].concat(path), undefined);

  if (nextState !== reference) {
    nextState = updateSubmitErrorState(nextState);
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateVisited = (key: string, visited: boolean) => (state: State) => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }

  let nextState = state;

  const updater = (currentVisited) => {
    return !!currentVisited === visited ? currentVisited : visited;
  };

  nextState = setWith(nextState, ['visitedMap', key], updater);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateTouched = (key: string, touched: boolean) => (state: State) => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }

  let nextState = state;

  const updater = (currentTouched) => {
    return !!currentTouched === touched ? currentTouched : touched;
  };

  nextState = setWith(nextState, ['touchedMap', key], updater);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateFocused = (key: string, focused: boolean) => (state: State) => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }

  if (focused) {
    if (state.focusedPath === key) {
      return null;
    }

    return {focusedPath: key};
  }

  if (state.focusedPath !== key) {
    return null;
  }

  return {focusedPath: null};
};

const runWarn = <T>(state: State, props: Props<T>) => {
  let nextState = state;

  if (state.warningStale) {
    const warningState = props.warn(state.valueState) || null;

    nextState = set(nextState, ['warningStale'], false);
    nextState = set(nextState, ['warningState'], warningState);
  }

  if (nextState.warningState !== state.warningState) {
    nextState = updateWarningState(nextState);
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const runValidate = <T>(state: State, props: Props<T>) => {
  let nextState = state;

  if (state.validationStale) {
    const errorState = props.validate(state.valueState) || null;

    nextState = set(nextState, ['validationStale'], false);
    nextState = set(nextState, ['errorState'], errorState);
  }

  if (nextState.errorState !== state.errorState) {
    nextState = updateErrorState(nextState);
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateSubmit = (error?: Error) => (state: State) => {
  let nextState = state;

  nextState = set(nextState, ['submitting'], false);
  nextState = set(nextState, ['submitSucceeded'], !error);
  nextState = set(nextState, ['submitFailed'], !!error);

  let submitErrorState;

  if (error && error instanceof SubmitValidationError) {
    submitErrorState = error.errors;
  } else {
    submitErrorState = null;
  }

  nextState = set(nextState, ['submitErrorState'], submitErrorState);
  nextState = updateSubmitErrorState(nextState);

  return nextState;
};

class DefaultStateProvider<T> extends React.PureComponent<Props<T>, State> {
  static defaultProps: typeof DefaultStateProvider.defaultProps;
  static getDerivedStateFromProps: typeof DefaultStateProvider.getDerivedStateFromProps;

  _willUnmount: boolean;

  setValue(path: Path, value: mixed) {
    this.setState(updateValue(parsePath(path), value));
  }

  setInitialValue(path: Path, value: mixed) {
    this.setState(updateInitialValue(parsePath(path), value));
  }

  setPendingValue(path: Path, value: mixed) {
    this.setState(updatePendingValue(parsePath(path), value));
  }

  setWarning(path: Path, error: mixed) {
    this.setState(updateWarning(parsePath(path), error));
  }

  setError(path: Path, error: mixed) {
    this.setState(updateError(parsePath(path), error));
  }

  setVisited(path: Path, visited: boolean) {
    this.setState(updateVisited(formatPath(path), visited));
  }

  setTouched(path: Path, touched: boolean) {
    this.setState(updateTouched(formatPath(path), touched));
  }

  setFocused(path: Path, focused: boolean) {
    this.setState(updateFocused(formatPath(path), focused));
  }

  validate() {
    this.setState(runWarn);
    this.setState(runValidate);
  }

  submit(event?: Event | SyntheticEvent<>) {
    if (event) {
      event.preventDefault();
    }

    let promise: Promise<T>;

    const setState = (update) =>
      new Promise(
        (resolve) =>
          this._willUnmount ? resolve() : this.setState(update, resolve),
      );

    setState((state, props) => {
      let nextState = state;

      if (nextState.submitting) {
        promise = Promise.reject(
          new Error('Form submit blocked pending current submit resolution.'),
        );
        return null;
      }

      nextState = runValidate(nextState, props) || nextState;

      if (nextState.errorState !== null) {
        promise = Promise.reject(
          new SubmitValidationError(nextState.errorState),
        );

        if (nextState === state) {
          return null;
        }

        return nextState;
      }

      nextState = set(nextState, ['submitting'], true);

      promise = Promise.resolve(nextState.valueState).then(props.onSubmit);

      return nextState;
    }).then(() => {
      promise.then(
        (result) =>
          setState(updateSubmit()).then(() =>
            this.props.onSubmitSuccess(result),
          ),
        (error) =>
          setState(updateSubmit(error)).then(
            () =>
              error instanceof SubmitValidationError
                ? this.props.onSubmitValidationFail(error)
                : this.props.onSubmitFail(error),
          ),
      );
    });
  }

  getInitialState() {
    let state = {
      initialValueState: this.props.values,
      valueState: this.props.values,
      pendingValueState: this.props.values,
      warningState: null,
      errorState: null,
      submitErrorState: null,
      focusedPath: null,
      touchedMap: {},
      visitedMap: {},
      submitting: false,
      submitFailed: false,
      submitSucceeded: false,
      warningStale: true,
      validationStale: true,

      actions: {
        setValue: this.setValue.bind(this),
        setInitialValue: this.setInitialValue.bind(this),
        setPendingValue: this.setPendingValue.bind(this),
        setWarning: this.setError.bind(this),
        setError: this.setError.bind(this),
        setTouched: this.setTouched.bind(this),
        setVisited: this.setVisited.bind(this),
        setFocused: this.setFocused.bind(this),
        validate: this.validate.bind(this),
        submit: this.submit.bind(this),
      },
    };

    state = runValidate(state, this.props) || state;
    state = runWarn(state, this.props) || state;

    return state;
  }

  componentWillUnmount() {
    this._willUnmount = true;
  }

  constructor(props: Props<T>) {
    super(props);
    this._willUnmount = false;
    this.state = this.getInitialState();
  }

  render() {
    const {children} = this.props;
    return children(this.state);
  }
}

DefaultStateProvider.defaultProps = {
  values: {},
  onSubmit: () => {},
  onSubmitFail: (error: Error) => Promise.reject(error),
  onSubmitSuccess: () => {},
  onSubmitValidationFail: () => {},
  warn: () => null,
  validate: () => null,
};

DefaultStateProvider.getDerivedStateFromProps = <T>(
  props: Props<T>,
  state: State,
) => {
  let nextState = state;

  nextState = set(nextState, ['pendingValueState'], props.values);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

export default DefaultStateProvider;
