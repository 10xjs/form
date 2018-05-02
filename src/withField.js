// @flow
import * as React from 'react';
// flowlint untyped-import:off
import hoistStatics from 'hoist-non-react-statics';
// flowlint untyped-import:error

import type {FieldRenderProps} from './types';

import Field from './Field';

const withField = <P: string>(
  propName: P,
  config: $Diff<React.ElementConfig<typeof Field>, {children: *}>,
) => <T, R: {[P]: FieldRenderProps} & T>(
  Component: React.ComponentType<T>,
): React.ComponentType<R> => {
  class WithField extends React.PureComponent<R> {
    render() {
      return (
        <Field {...config}>
          {(fieldProps: FieldRenderProps) => (
            <Component {...{[propName]: fieldProps}} {...this.props} />
          )}
        </Field>
      );
    }
  }

  return hoistStatics(WithField, Component);
};

export default withField;
