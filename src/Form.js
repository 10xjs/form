// @flow strict

import * as React from 'react';

import type {
  FormProps,
  FormWrapperProps,
  Context,
  FormActions,
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
    return this.props.children(
      Object.assign({}, this.props.actions, {
        submitting: this.props.submitting,
        submitFailed: this.props.submitFailed,
        submitSucceeded: this.props.submitSucceeded,
        hasErrors: this.props.hasErrors,
        hasSubmitErrors: this.props.hasSubmitErrors,
        hasWarnings: this.props.hasWarnings,
      }),
    );
  }
}

class Form<StateProviderProps>
  extends React.PureComponent<FormProps<StateProviderProps>, Context>
  implements FormActions {
  static defaultProps: typeof Form.defaultProps;

  _lastSetActions: ?FormActions;
  setValue: (path: Path, value: mixed) => void;
  setInitialValue: (path: Path, value: mixed) => void;
  setPendingValue: (path: Path, value: mixed) => void;
  setTouched: (path: Path, touched: boolean) => void;
  setVisited: (path: Path, visited: boolean) => void;
  setFocused: (path: Path, focused: boolean) => void;
  submit: (event?: Event | SyntheticEvent<>) => void;

  render() {
    return this.props.stateProvider(this.props, (context: Context) => {
      if (this._lastSetActions !== context.actions) {
        Object.assign(this, context.actions);
        this._lastSetActions = context.actions;
      }
      return (
        <Provider value={context}>
          <FormWrapper
            actions={context.actions}
            submitting={context.submitting}
            submitFailed={context.submitFailed}
            submitSucceeded={context.submitSucceeded}
            hasErrors={context.errorState !== null}
            hasSubmitErrors={context.submitErrorState !== null}
            hasWarnings={context.warningState !== null}
          >
            {this.props.children}
          </FormWrapper>
        </Provider>
      );
    });
  }
}

Form.defaultProps = {
  stateProvider: defaultStateProviderProp,
};

export default Form;
