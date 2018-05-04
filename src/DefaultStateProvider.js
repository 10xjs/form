// @flow strict

import * as React from 'react';

import type {DefaultStateProviderProps, Context, Path} from './types';

import {set, matchesDeep, parsePath, formatPath} from './util';
import SubmitValidationError from './SubmitValidationError';
import {Provider} from './context';

const updateValue = (path, value) => (state: Context) => {
  if (path.length < 1) {
    throw new Error('unexpected empty path');
  }

  let nextState = state;

  nextState = set(nextState, ['valueState', ...path], value);

  if (nextState === state) {
    return null;
  }

  nextState = set(nextState, ['warningState', ...path], undefined);

  if (nextState.warningState !== state.warningState) {
    nextState = set(nextState, ['warningStale'], true);
  }

  nextState = set(nextState, ['errorState', ...path], undefined);

  if (nextState.errorState !== state.errorState) {
    nextState = set(nextState, ['validationStale'], true);
  }

  nextState = set(nextState, ['submitErrorState', ...path], undefined);

  return nextState;
};

const updateInitialValue = (path, value) => (state: Context) => {
  if (path.length < 1) {
    throw new Error('unexpected empty path');
  }

  let nextState = state;

  nextState = set(nextState, ['initialValueState', ...path], value);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updatePendingValue = (path, value) => (state: Context) => {
  if (path.length < 1) {
    throw new Error('unexpected empty path');
  }

  let nextState = state;

  nextState = set(nextState, ['pendingValueState', ...path], value);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateError = (path, error) => (state: Context) => {
  if (path.length < 1) {
    throw new Error('unexpected empty path');
  }

  let nextState = state;

  nextState = set(nextState, ['errorState', ...path], error);
  nextState = set(nextState, ['submitErrorState', ...path], undefined);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateVisited = (key, visited) => (state: Context) => {
  let nextState = state;

  nextState = set(nextState, ['visitedMap', key], visited);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateTouched = (key, touched) => (state: Context) => {
  let nextState = state;

  nextState = set(nextState, ['touchedMap', key], touched);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateFocused = (key, focused) => (state: Context) => {
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

const updateValidation = <T>(
  state: Context,
  props: DefaultStateProviderProps<T>,
) => {
  let nextState = state;

  if (state.validationStale) {
    const errorState = props.validate(state.valueState);
    const invalid = matchesDeep(
      errorState,
      (value) =>
        !/^\[object (Object|Array|Undefined)\]$/.test(
          Object.prototype.toString.call(value),
        ),
    );

    nextState = set(nextState, ['validationStale'], false);
    nextState = set(nextState, ['errorState'], errorState);
    nextState = set(nextState, ['valid'], !invalid);
  }

  if (state.warningStale) {
    const warningState = props.warn(state.valueState);

    nextState = set(nextState, ['warningStale'], false);
    nextState = set(nextState, ['warningState'], warningState);
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateSubmit = (error?: Error) => (state) => {
  let nextState = state;

  nextState = set(nextState, ['submitting'], false);
  nextState = set(nextState, ['submitSucceeded'], !error);
  nextState = set(nextState, ['submitFailed'], !!error);

  let submitErrorState;

  if (error && error instanceof SubmitValidationError) {
    submitErrorState = error.errors;
  } else {
    submitErrorState = Array.isArray(nextState.submitErrorState) ? [] : {};
  }

  nextState = set(nextState, ['submitErrorState'], submitErrorState);

  return nextState;
};

class DefaultStateProvider<T> extends React.PureComponent<
  DefaultStateProviderProps<T>,
  Context,
> {
  static defaultProps = {
    values: {},
    onSubmit: () => {},
    onSubmitFail: (error: Error) => Promise.reject(error),
    onSubmitSuccess: () => {},
    onSubmitValidationFail: () => {},
    warn: () => ({}),
    validate: () => ({}),
  };

  static getDerivedStateFromProps(
    state: Context,
    props: DefaultStateProviderProps<T>,
  ) {
    let nextState = state;

    nextState = set(nextState, ['pendingValueState'], props.values);

    if (nextState === state) {
      return null;
    }

    return nextState;
  }

  setValue = (path: Path, value: mixed) => {
    this.setState(updateValue(parsePath(path), value));
  };

  setInitialValue = (path: Path, value: mixed) => {
    this.setState(updateInitialValue(parsePath(path), value));
  };

  setPendingValue = (path: Path, value: mixed) => {
    this.setState(updatePendingValue(parsePath(path), value));
  };

  setError = (path: Path, error: mixed) => {
    this.setState(updateError(parsePath(path), error));
  };

  setVisited = (path: Path, visited: boolean) => {
    this.setState(updateVisited(formatPath(path), visited));
  };

  setTouched = (path: Path, touched: boolean) => {
    this.setState(updateTouched(formatPath(path), touched));
  };

  setFocused = (path: Path, focused: boolean) => {
    this.setState(updateFocused(formatPath(path), focused));
  };

  validate = () => {
    this.setState(updateValidation);
  };

  submit = (event?: Event | SyntheticEvent<>): void => {
    if (event) {
      event.preventDefault();
    }

    let promise: Promise<T>;

    this.setState(
      (state, props) => {
        let nextState = state;

        if (nextState.submitting) {
          promise = Promise.reject(
            new Error('Form submit blocked pending current submit resolution.'),
          );
          return null;
        }

        nextState = updateValidation(nextState, props) || nextState;

        if (!nextState.valid) {
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
      },
      () => {
        promise.then(
          (result) =>
            new Promise((resolve) =>
              this.setState(updateSubmit(), () => {
                resolve(this.props.onSubmitSuccess(result));
              }),
            ),
          (error) =>
            new Promise((resolve) => {
              this.setState(updateSubmit(error), () => {
                if (error instanceof SubmitValidationError) {
                  resolve(this.props.onSubmitValidationFail(error));
                } else {
                  resolve(this.props.onSubmitFail(error));
                }
              });
            }),
        );
      },
    );
  };

  state = {
    initialValueState: this.props.values,
    valueState: this.props.values,
    pendingValueState: this.props.values,
    warningState: {},
    errorState: {},
    submitErrorState: {},
    focusedPath: null,
    touchedMap: {},
    visitedMap: {},
    submitting: false,
    submitFailed: false,
    submitSucceeded: false,
    warningStale: true,
    validationStale: true,
    valid: true,

    actions: {
      setValue: this.setValue,
      setInitialValue: this.setInitialValue,
      setPendingValue: this.setPendingValue,
      setError: this.setError,
      setTouched: this.setTouched,
      setVisited: this.setVisited,
      setFocused: this.setFocused,
      validate: this.validate,
      submit: this.submit,
    },
  };

  render() {
    const {children} = this.props;

    return <Provider value={this.state}>{children(this.state)}</Provider>;
  }
}

export default DefaultStateProvider;
