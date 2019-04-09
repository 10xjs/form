import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import {FieldRenderProps} from './types';
import {isValidPath, emptyPathError} from './util';
import Field from './Field';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const withField = <P extends string>(
  propName: P,
  config: Omit<
    JSX.LibraryManagedAttributes<typeof Field, Field['props']>,
    'children'
  >,
) => <T, R extends {[key in P]: FieldRenderProps} & T>(
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
    public render(): React.ReactNode {
      return (
        <Field {...config}>
          {(fieldProps: FieldRenderProps): React.ReactNode => {
            return <Component {...{[propName]: fieldProps}} {...this.props} />;
          }}
        </Field>
      );
    }
  }

  return hoistNonReactStatics(WithField, Component);
};

export default withField;
