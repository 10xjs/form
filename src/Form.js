// @flow

import * as React from 'react';

import type {FormProps, FormWrapperProps, Context} from './types';

import {Provider} from './context';

import DefaultStateProvider from './DefaultStateProvider';

function defaultStateProviderProp(
  config: React.ElementConfig<typeof DefaultStateProvider>,
  render: (context: Context) => React.Node,
) {
  return <DefaultStateProvider {...config}>{render}</DefaultStateProvider>;
}

class FormWrapper extends React.PureComponent<FormWrapperProps> {
  render() {
    const {actions, children} = this.props;
    return children(actions);
  }
}

class Form<StateProviderProps> extends React.PureComponent<
  FormProps<StateProviderProps>,
  Context,
> {
  static defaultProps = {
    stateProvider: defaultStateProviderProp,
  };

  render() {
    const {stateProvider, children, ...config} = this.props;

    return stateProvider(config, (context: Context) => (
      <Provider value={context}>
        <FormWrapper actions={context.actions}>{children}</FormWrapper>
      </Provider>
    ));
  }
}

export default Form;
