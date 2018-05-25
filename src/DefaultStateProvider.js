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
type State = {_props: *} & Context;

const updateWarningState = (state: State) => {
  let nextState: State = state;

  if (!hasValue(nextState.warningState)) {
    nextState = set(nextState, ['warningState'], null);
  }

  return nextState;
};

const updateErrorState = (state: State) => {
  let nextState: State = state;

  if (!hasValue(nextState.errorState)) {
    nextState = set(nextState, ['errorState'], null);
  }

  return nextState;
};

const updateSubmitErrorState = (state: State) => {
  let nextState: State = state;

  if (!hasValue(nextState.submitErrorState)) {
    nextState = set(nextState, ['submitErrorState'], null);
  }

  return nextState;
};

const runWarn = <T>(state: State, props: Props<T>) => {
  let nextState: State = state;

  const warningState = props.warn(state.valueState) || null;

  nextState = set(nextState, ['warningState'], warningState);

  if (nextState.warningState !== state.warningState) {
    nextState = updateWarningState(nextState);
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const runValidate = <T>(state: State, props: Props<T>) => {
  let nextState: State = state;

  const errorState = props.validate(state.valueState) || null;

  nextState = set(nextState, ['errorState'], errorState);

  if (nextState.errorState !== state.errorState) {
    nextState = updateErrorState(nextState);
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateValue = (path: PathArray, value: mixed) => <T>(
  state: State,
  props: Props<T>,
) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState: State = state;

  nextState = set(nextState, ['valueState'].concat(path), value);

  if (nextState === state) {
    return null;
  }

  nextState = runWarn(nextState, props) || nextState;
  nextState = runValidate(nextState, props) || nextState;
  nextState = set(nextState, ['submitErrorState'], null);

  return nextState;
};

const updateInitialValue = (path: PathArray, value: mixed) => (
  state: State,
) => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState: State = state;

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

  let nextState: State = state;

  nextState = set(nextState, ['pendingValueState'].concat(path), value);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateVisited = (key: string, visited: boolean) => (state: State) => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }

  let nextState: State = state;

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
  let nextState: State = state;

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

const updateSubmit = (error?: Error) => (state: State) => {
  let nextState: State = state;

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

  setVisited(path: Path, visited: boolean) {
    this.setState(updateVisited(formatPath(path), visited));
  }

  setTouched(path: Path, touched: boolean) {
    this.setState(updateTouched(formatPath(path), touched));
  }

  setFocused(path: Path, focused: boolean) {
    this.setState(updateFocused(formatPath(path), focused));
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
      if (state.submitting) {
        promise = Promise.reject(
          new Error('Form submit blocked pending current submit resolution.'),
        );
        return null;
      }

      if (state.errorState !== null) {
        promise = Promise.reject(new SubmitValidationError(state.errorState));
        return null;
      }

      promise = Promise.resolve(state.valueState).then(props.onSubmit);

      return set(state, ['submitting'], true);
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

      actions: {
        setValue: this.setValue.bind(this),
        setInitialValue: this.setInitialValue.bind(this),
        setPendingValue: this.setPendingValue.bind(this),
        setTouched: this.setTouched.bind(this),
        setVisited: this.setVisited.bind(this),
        setFocused: this.setFocused.bind(this),
        submit: this.submit.bind(this),
      },

      // Cache prop values for comparison in getDerivedStateFromProps
      _props: {
        warn: this.props.warn,
        validate: this.props.validate,
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
  let nextState: State = state;

  nextState = set(nextState, ['pendingValueState'], props.values);

  if (props.validate !== state._props.validate) {
    nextState = set(nextState, ['_props', 'validate'], props.validate);
    nextState = runValidate(nextState, props) || nextState;
  }

  if (props.warn !== state._props.warn) {
    nextState = set(nextState, ['_props', 'warn'], props.warn);
    nextState = runWarn(nextState, props) || nextState;
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

export default DefaultStateProvider;
