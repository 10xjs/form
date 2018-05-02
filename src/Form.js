// @flow

import * as React from 'react';

import type {FormProps, Context} from './types';

import {Provider} from './context';

import DefaultStateProvider from './DefaultStateProvider';
import FormWrapper from './FormWrapper';

function defaultStateProvider(
  config: React.ElementConfig<typeof DefaultStateProvider>,
  render: (context: Context) => React.Node,
) {
  return <DefaultStateProvider {...config}>{render}</DefaultStateProvider>;
}

class Form<StateProviderProps> extends React.PureComponent<
  FormProps<StateProviderProps>,
  Context,
> {
  static defaultProps = {
    stateProvider: defaultStateProvider,
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
