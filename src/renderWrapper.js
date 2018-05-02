// @flow

import * as React from 'react';

import type {FieldConfig, Context} from './types';
import {get, parsePath, formatPath} from './util';

const renderWrapper = <P, T>(
  Wrapper: React.ComponentType<P & T>,
  config: $Exact<FieldConfig>,
  context: Context,
  props: T,
) => {
  const parsedPath = parsePath(config.path);
  const formattedPath = formatPath(config.path);

  const {
    initialValueState,
    valueState,
    pendingValueState,
    errorState,
    submitErrorState,
    touchedMap,
    visitedMap,
    submitting,
    actions,
  } = context;

  return (
    <Wrapper
      {...config}
      initialValue={get(initialValueState, parsedPath)}
      value={get(valueState, parsedPath)}
      pendingValue={get(pendingValueState, parsedPath)}
      error={get(submitErrorState, parsedPath) || get(errorState, parsedPath)}
      focused={focus === formattedPath}
      touched={!!touchedMap[formattedPath]}
      visited={!!visitedMap[formattedPath]}
      submitting={!!submitting}
      {...actions}
      {...props}
    />
  );
};

export default renderWrapper;
