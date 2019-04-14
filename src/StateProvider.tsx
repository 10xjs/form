import * as React from 'react';

import {StateProviderProps, Context, PathArray, Path} from './types';

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

type Props = StateProviderProps;
type State = {_props: Pick<Props, 'warn' | 'validate'>} & Context;

type StateUpdater = (state: State, props: Props) => State | null;

const updateWarningState = (state: State): State | null => {
  let nextState: State | null = state;

  if (!hasValue(nextState.warningState)) {
    nextState = set(nextState, ['warningState'], null);
  }

  return nextState;
};

const updateErrorState = (state: State): State | null => {
  let nextState: State | null = state;

  if (!hasValue(nextState.errorState)) {
    nextState = set(nextState, ['errorState'], null);
  }

  return nextState;
};

const updateSubmitErrorState = (state: State): State | null => {
  let nextState: State = state;

  if (!hasValue(nextState.submitErrorState)) {
    nextState = set(nextState, ['submitErrorState'], null);
  }

  return nextState;
};

const runWarn = (state: State, props: Props): State | null => {
  let nextState: State = state;

  const warningState = props.warn(state.valueState) || null;

  nextState = set(nextState, ['warningState'], warningState);

  if (nextState.warningState !== state.warningState) {
    nextState = updateWarningState(nextState) || nextState;
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const runValidate = (state: State, props: Props): State | null => {
  let nextState: State = state;

  const errorState = props.validate(state.valueState) || null;

  nextState = set(nextState, ['errorState'], errorState) || nextState;

  if (nextState.errorState !== state.errorState) {
    nextState = updateErrorState(nextState) || nextState;
  }

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateValue = (path: PathArray, value: unknown): StateUpdater => (
  state: State,
  props: Props,
): State | null => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState: State | null = state;

  nextState = set(nextState, (['valueState'] as PathArray).concat(path), value);

  if (nextState === state) {
    return null;
  }

  nextState = runWarn(nextState, props) || nextState;
  nextState = runValidate(nextState, props) || nextState;
  nextState = set(nextState, ['submitErrorState'], null);

  return nextState;
};

const updateInitialValue = (path: PathArray, value: unknown): StateUpdater => (
  state: State,
): State | null => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = set(
    nextState,
    (['initialValueState'] as PathArray).concat(path),
    value,
  );

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updatePendingValue = (path: PathArray, value: unknown): StateUpdater => (
  state: State,
): State | null => {
  if (path.length < 1) {
    throw new TypeError(emptyPathArrayError());
  }

  let nextState = state;

  nextState = set(
    nextState,
    (['pendingValueState'] as PathArray).concat(path),
    value,
  );

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateVisited = (key: string, visited: boolean): StateUpdater => (
  state: State,
): State | null => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }

  let nextState = state;

  const updater = (currentVisited: boolean): boolean => {
    return !!currentVisited === visited ? currentVisited : visited;
  };

  nextState = setWith(nextState, ['visitedMap', key], updater);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateTouched = (key: string, touched: boolean): StateUpdater => (
  state: State,
): State | null => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }
  let nextState = state;

  const updater = (currentTouched: boolean): boolean => {
    return !!currentTouched === touched ? currentTouched : touched;
  };

  nextState = setWith(nextState, ['touchedMap', key], updater);

  if (nextState === state) {
    return null;
  }

  return nextState;
};

const updateFocused = (key: string, focused: boolean): StateUpdater => (
  state: State,
): State | null => {
  if (key.length < 1) {
    throw new TypeError(emptyPathStringError());
  }

  if (focused) {
    if (state.focusedPath === key) {
      return null;
    }

    return set(state, ['focusedPath'], key);
  }

  if (state.focusedPath !== key) {
    return null;
  }

  return set(state, ['focusedPath'], null);
};

const updateSubmit = (error?: Error): StateUpdater => (
  state: State,
): State | null => {
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
  nextState = updateSubmitErrorState(nextState) || nextState;

  return nextState;
};

class StateProvider extends React.PureComponent<Props, State> {
  public static getDerivedStateFromProps = (
    props: Props,
    state: State,
  ): State | null => {
    let nextState = state;

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

  private _willUnmount: boolean = false;

  public setValue(path: Path, value: unknown): void {
    this.setState(updateValue(parsePath(path), value));
  }

  public setInitialValue(path: Path, value: unknown): void {
    this.setState(updateInitialValue(parsePath(path), value));
  }

  public setPendingValue(path: Path, value: unknown): void {
    this.setState(updatePendingValue(parsePath(path), value));
  }

  public setVisited(path: Path, visited: boolean): void {
    this.setState(updateVisited(formatPath(path), visited));
  }

  public setTouched(path: Path, touched: boolean): void {
    this.setState(updateTouched(formatPath(path), touched));
  }

  public setFocused(path: Path, focused: boolean): void {
    this.setState(updateFocused(formatPath(path), focused));
  }

  public submit(event?: Event | React.SyntheticEvent<HTMLElement>): void {
    if (event) {
      event.preventDefault();
    }

    let promise: Promise<any>;

    const setState = (
      update: (state: State, props: Props) => State | null,
    ): Promise<void> =>
      new Promise(
        (resolve: () => void): void =>
          this._willUnmount ? resolve() : this.setState(update, resolve),
      );

    setState(
      (state: State, props: Props): State | null => {
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
      },
    ).then(
      (): void => {
        promise.then(
          (result): unknown =>
            setState(updateSubmit()).then(
              (): unknown => this.props.onSubmitSuccess(result),
            ),
          (error): unknown =>
            setState(updateSubmit(error)).then(
              (): unknown =>
                error instanceof SubmitValidationError
                  ? this.props.onSubmitValidationFail(error)
                  : this.props.onSubmitFail(error),
            ),
        );
      },
    );
  }

  public getInitialState(): State {
    let state: State = {
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

  public componentWillUnmount(): void {
    this._willUnmount = true;
  }

  public constructor(props: Props) {
    super(props);
    this._willUnmount = false;
    this.state = this.getInitialState();
  }

  public render(): React.ReactNode {
    const {children} = this.props;
    return children(this.state);
  }
}

export default StateProvider;
