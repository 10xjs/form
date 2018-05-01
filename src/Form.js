// @flow
/* eslint-disable react/sort-comp */
import * as React from 'react';

import {set, get, equalsDeep, matchesDeep, parsePath, formatPath} from './util';
import SubmitValidationError from './SubmitValidationError';
import {Provider} from './context';

import type {FormProps, FormState, Path} from './types';

class Form<T> extends React.PureComponent<FormProps<T>, FormState> {
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
      const currentValue = get(state.valueState, parsedPath);

      if (equalsDeep(currentValue, value)) {
        return null;
      }

      const valueState = set(state.valueState, parsedPath, value);
      const errorState = set(state.errorState, parsedPath, undefined);
      const submitErrorState = set(
        state.submitErrorState,
        parsedPath,
        undefined,
      );
      const validationStale = true;

      return {valueState, errorState, submitErrorState, validationStale};
    });
  };

  setInitialValue = (path: Path, value: mixed) => {
    const parsedPath = parsePath(path);

    this.setState((state) => {
      const currentValue = get(state.initialValueState, parsedPath);

      if (equalsDeep(currentValue, value)) {
        return null;
      }

      const initialValueState = set(state.initialValueState, parsedPath, value);

      return {initialValueState};
    });
  };

  setError = (path: Path, error: mixed) => {
    const parsedPath = parsePath(path);

    this.setState((state) => {
      const currentError = get(state.errorState, parsedPath);

      if (equalsDeep(currentError, error)) {
        return null;
      }

      const errorState = set(state.errorState, parsedPath, error);
      const submitErrorState = set(
        state.submitErrorState,
        parsedPath,
        undefined,
      );
      const validationStale = true;

      return {errorState, submitErrorState, validationStale};
    });
  };

  setVisited = (path: Path) => {
    const formattedPath = formatPath(path);

    this.setState((state) => {
      if (state.visitedMap[formattedPath]) {
        return null;
      }

      const visitedMap = {...state.visitedMap, [formattedPath]: true};
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

      const touchedMap = {...state.touchedMap, [formattedPath]: true};
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

      const errorState = props.validate(state.valueState) || {};
      const validationStale = false;
      const valid = matchesDeep(
        errorState,
        (value) =>
          !/^\[object (Object|Array)\]$/.test(
            Object.prototype.toString.call(value),
          ),
      );

      return {errorState, validationStale, valid};
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
      setError: this.setError,
      setTouched: this.setTouched,
      setVisited: this.setVisited,
      setFocused: this.setFocused,
      clearFocused: this.clearFocused,
      validate: this.validate,
      submit: this.submit,
    },
  };

  componentWillReceiveProps(nextProps: FormProps<T>) {
    this.setState({pendingValueState: nextProps.values});
  }

  render() {
    const {children} = this.props;

    return <Provider value={this.state}>{children(this.state)}</Provider>;
  }
}

export default Form;
