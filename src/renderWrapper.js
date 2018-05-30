// @flow strict

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
    warningState,
    errorState,
    submitErrorState,
    focusedPath,
    touchedMap,
    visitedMap,
    submitting,
    actions,
  } = context;

  const warning =
    warningState !== null ? get(warningState, parsedPath) : undefined;

  const error = errorState !== null ? get(errorState, parsedPath) : undefined;

  const submitError =
    submitErrorState !== null ? get(submitErrorState, parsedPath) : undefined;

  return (
    <Wrapper
      {...config}
      initialValue={get(initialValueState, parsedPath)}
      value={get(valueState, parsedPath)}
      pendingValue={get(pendingValueState, parsedPath)}
      warning={warning}
      error={error}
      submitError={submitError}
      focused={focusedPath === formattedPath}
      touched={!!touchedMap[formattedPath]}
      visited={!!visitedMap[formattedPath]}
      submitting={!!submitting}
      {...actions}
      {...props}
    />
  );
};

export default renderWrapper;
