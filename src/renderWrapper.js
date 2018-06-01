// @flow strict

import * as React from 'react';

import type {Path, FormActions, Context, FieldStateProps} from './types';
import {get, parsePath, formatPath} from './util';

const renderWrapper = <P: {path: Path}>(
  Wrapper: React.ComponentType<P & FieldStateProps & FormActions>,
  context: Context,
  props: P,
) => {
  const parsedPath = parsePath(props.path);
  const formattedPath = formatPath(props.path);

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

  let error =
    submitErrorState !== null ? get(submitErrorState, parsedPath) : undefined;

  if ((error === undefined || error === null) && errorState !== null) {
    error = get(errorState, parsedPath);
  }

  return (
    <Wrapper
      {...props}
      initialValue={get(initialValueState, parsedPath)}
      value={get(valueState, parsedPath)}
      pendingValue={get(pendingValueState, parsedPath)}
      warning={warning}
      error={error}
      focused={focusedPath === formattedPath}
      touched={!!touchedMap[formattedPath]}
      visited={!!visitedMap[formattedPath]}
      submitting={!!submitting}
      {...actions}
    />
  );
};

export default renderWrapper;
