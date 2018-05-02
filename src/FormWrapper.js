// @flow

import * as React from 'react';

import type {FormWrapperProps} from './types';

class FormWrapper extends React.PureComponent<FormWrapperProps> {
  render() {
    const {actions, children} = this.props;
    return children(actions);
  }
}

export default FormWrapper;
