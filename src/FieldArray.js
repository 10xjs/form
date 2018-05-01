// @flow
import * as React from 'react';

import type {FieldArrayProps, FieldArrayRenderProps} from './types';
import {Consumer} from './context';
import FieldArrayWrapper from './FieldArrayWrapper';
import renderWrapper from './renderWrapper';

class FieldArray extends React.PureComponent<FieldArrayProps> {
  static defaultProps = {
    children: ({fields}: FieldArrayRenderProps) => fields,
  };

  render() {
    const {
      path,
      format,
      parse,
      checkbox,
      validateOnBlur,
      validateOnChange,
      renderField,
      children,
    } = this.props;

    return (
      <Consumer>
        {(context) =>
          context !== null &&
          renderWrapper(
            FieldArrayWrapper,
            {
              path,
              format,
              parse,
              checkbox,
              validateOnBlur,
              validateOnChange,
            },
            context,
            {renderField, children},
          )
        }
      </Consumer>
    );
  }
}

export default FieldArray;
