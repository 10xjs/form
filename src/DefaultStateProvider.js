// @flow

import * as React from 'react';

import type {DefaultStateProviderProps, Context, Path} from './types';

import {set, matchesDeep, parsePath, formatPath, lazyUpdate} from './util';
import SubmitValidationError from './SubmitValidationError';
import {Provider} from './context';

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
    validate: () => {},
  };

  _submitPromise: Promise<T> | null = null;

  setValue = (path: Path, value: mixed) => {
    const parsedPath = parsePath(path);

    this.setState((state) => {
      const valueState = set(state.valueState, parsedPath, value);
      const errorState = set(state.errorState, parsedPath, undefined);
      const submitErrorState = set(
        state.submitErrorState,
        parsedPath,
        undefined,
      );
      const validationStale = true;

      return lazyUpdate(state, {
        valueState,
        errorState,
        submitErrorState,
        validationStale,
      });
    });
  };

  setInitialValue = (path: Path, value: mixed) => {
    const parsedPath = parsePath(path);

    this.setState((state) => {
      const initialValueState = set(state.initialValueState, parsedPath, value);

      return lazyUpdate(state, {initialValueState});
    });
  };

  setPendingValue = (path: Path, value: mixed) => {
    const parsedPath = parsePath(path);

    this.setState((state) => {
      const pendingValueState = set(state.pendingValueState, parsedPath, value);

      return lazyUpdate(state, {pendingValueState});
    });
  };

  setError = (path: Path, error: mixed) => {
    const parsedPath = parsePath(path);

    this.setState((state) => {
      const errorState = set(state.errorState, parsedPath, error);
      const submitErrorState = set(
        state.submitErrorState,
        parsedPath,
        undefined,
      );
      const validationStale = true;

      return lazyUpdate(state, {errorState, submitErrorState, validationStale});
    });
  };

  setVisited = (path: Path) => {
    const formattedPath = formatPath(path);

    this.setState((state) => {
      if (state.visitedMap[formattedPath]) {
        return null;
      }

      const visitedMap = {...state.visitedMap};
      visitedMap[formattedPath] = true;

      return {visitedMap};
    });
  };

  setTouched = (path: Path) => {
    const formattedPath = formatPath(path);

    this.clearFocused(formattedPath);
    this.setState((state) => {
      if (state.touchedMap[formattedPath]) {
        return null;
      }

      const touchedMap = {...state.touchedMap};
      touchedMap[formattedPath] = true;

      return {touchedMap};
    });
  };

  setFocused = (path: Path) => {
    const formattedPath = formatPath(path);

    this.setState((state) => {
      if (state.focusedPath === formattedPath) {
        return null;
      }

      const focusedPath = formattedPath;
      return {focusedPath};
    });
  };

  clearFocused = (path: Path) => {
    const formattedPath = formatPath(path);

    this.setState((state) => {
      if (state.focusedPath !== formattedPath) {
        return null;
      }

      const focusedPath = formattedPath;
      return {focusedPath};
    });
  };

  validate = () => {
    this.setState((state, props) => {
      if (!state.validationStale) {
        return null;
      }

      const validationStale = false;
      const errorState = props.validate(state.valueState) || {};
      const valid = matchesDeep(
        errorState,
        (value) =>
          !/^\[object (Object|Array|Undefined)\]$/.test(
            Object.prototype.toString.call(value),
          ),
      );

      return {validationStale, errorState, valid};
    });
  };

  submit = (event?: Event | SyntheticEvent<>): void => {
    if (event) {
      event.preventDefault();
    }

    if (this._submitPromise !== null) {
      throw new Error('Form submit blocked pending current submit resolution.');
    }

    const promise = (this._submitPromise = Promise.resolve(
      this.props.onSubmit(this.state.valueState),
    ));

    this.setState({submitting: true}, () => {
      promise.then(
        (result) =>
          new Promise((resolve) =>
            this.setState(
              {
                submitting: true,
                submitSucceeded: true,
                submitFailed: false,
                submitErrorState: {},
              },
              () => {
                this._submitPromise = null;
                resolve(this.props.onSubmitSuccess(result));
              },
            ),
          ),
        (error) =>
          new Promise((resolve) => {
            if (error instanceof SubmitValidationError) {
              const {submitErrorState = {}} = error;
              this.setState(
                {
                  submitting: false,
                  submitSucceeded: false,
                  submitFailed: true,
                  submitErrorState,
                },
                () => {
                  this._submitPromise = null;
                  resolve(this.props.onSubmitValidationFail(error));
                },
              );
            }

            this.setState(
              {
                submitting: false,
                submitSucceeded: false,
                submitFailed: false,
              },
              () => {
                this._submitPromise = null;
                this.props.onSubmitFail(error);
              },
            );
          }),
      );
    });
  };

  state = {
    initialValueState: this.props.values,
    valueState: this.props.values,
    pendingValueState: this.props.values,
    errorState: {},
    submitErrorState: {},
    focusedPath: null,
    touchedMap: {},
    visitedMap: {},
    submitting: false,
    submitFailed: false,
    submitSucceeded: false,
    validationStale: false,
    valid: true,

    actions: {
      setValue: this.setValue,
      setInitialValue: this.setInitialValue,
      setPendingValue: this.setPendingValue,
      setError: this.setError,
      setTouched: this.setTouched,
      setVisited: this.setVisited,
      setFocused: this.setFocused,
      clearFocused: this.clearFocused,
      validate: this.validate,
      submit: this.submit,
    },
  };

  componentWillReceiveProps(nextProps: DefaultStateProviderProps<T>) {
    this.setState({pendingValueState: nextProps.values});
  }

  render() {
    const {children} = this.props;

    return <Provider value={this.state}>{children(this.state)}</Provider>;
  }
}

export default DefaultStateProvider;