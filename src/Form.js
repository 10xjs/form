// @flow strict

import * as React from 'react';

import type {
  FormProps,
  FormWrapperProps,
  Context,
  ContextActions,
  Path,
} from './types';

import {Provider} from './context';

import DefaultStateProvider from './DefaultStateProvider';

type DefaultStateProviderConfig = React.ElementConfig<
  typeof DefaultStateProvider,
>;
function defaultStateProviderProp(
  config: DefaultStateProviderConfig,
  render: (context: Context) => React.Node,
) {
  return <DefaultStateProvider {...config}>{render}</DefaultStateProvider>;
}

class FormWrapper extends React.PureComponent<FormWrapperProps> {
  render() {
    const {
      actions,
      submitting,
      submitFailed,
      submitSucceeded,
      valid,
      children,
    } = this.props;

    return children({
      ...actions,
      submitting,
      submitFailed,
      submitSucceeded,
      valid,
    });
  }
}

class Form<
  StateProviderProps = DefaultStateProviderConfig,
> extends React.PureComponent<FormProps<StateProviderProps>, Context> {
  static defaultProps = {
    stateProvider: defaultStateProviderProp,
  };

  _lastContextActions: ContextActions;
  setValue: (path: Path, value: mixed) => void;
  setInitialValue: (path: Path, value: mixed) => void;
  setPendingValue: (path: Path, value: mixed) => void;
  setError: (path: Path, error: mixed) => void;
  setTouched: (path: Path, touched: boolean) => void;
  setVisited: (path: Path, visited: boolean) => void;
  setFocused: (path: Path, focused: boolean) => void;
  validate: () => void;
  submit: (event?: Event | SyntheticEvent<>) => void;

  _handleStateUpdate(context: Context) {
    if (context.actions !== this._lastContextActions) {
      Object.assign(this, context.actions);
    }
    this._lastContextActions = context.actions;
  }

  render() {
    const {stateProvider, children, ...config} = this.props;

    return stateProvider(config, (context: Context) => {
      this._handleStateUpdate(context);
      return (
        <Provider value={context}>
          <FormWrapper
            actions={context.actions}
            submitting={submitting}
            submitFailed={submitFailed}
            submitSucceeded={submitSucceeded}
            valid={valid}
          >
            {children}
          </FormWrapper>
        </Provider>
      );
    });
  }
}

export default Form;
