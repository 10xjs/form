// @flow strict

import * as React from 'react';
// flowlint untyped-import:off
import hoistStatics from 'hoist-non-react-statics';
// flowlint untyped-import:error

import type {FieldRenderProps} from './types';
import {isValidPath, emptyPathError} from './util';
import Field from './Field';

const withField = <P: string>(
  propName: P,
  config: $Diff<React.ElementConfig<typeof Field>, {children: *}>,
) => <T, R: {[P]: FieldRenderProps} & T>(
  Component: React.ComponentType<T>,
): React.ComponentType<R> => {
  if (typeof propName !== 'string') {
    throw new TypeError('Invalid withField prop name. Expected string.');
  }

  if (!config || typeof config !== 'object') {
    throw new TypeError('Invalid withField config. Expected object.');
  }

  if (!isValidPath(config.path)) {
    throw new TypeError(emptyPathError());
  }

  class WithField extends React.PureComponent<R> {
    render() {
      return (
        <Field {...config}>
          {(fieldProps: FieldRenderProps) => {
            const props = {};
            props[propName] = fieldProps;
            return <Component {...props} {...this.props} />;
          }}
        </Field>
      );
    }
  }

  return hoistStatics(WithField, Component);
};

export default withField;
