import * as React from 'react';

import {Field, FieldData} from '../core/field';
import {FieldPath, FormState} from '../core/formState';
import {formatPath} from '../core/utils';

import {useForm} from './context';
import {useSubscribe} from './stateManager';

/**
 * The `useField` hook binds a {@link Field} instance to the branch of the form value state at `path` and subscribes to its state changes as local component state.
 * @typeParam T - Field value type.
 *
 * ```jsx
 * const ConnectedField = () => {
 *   const [state, field] = useField('fieldPath');
 *
 *   return (
 *    <input
 *      value={state.value}
 *      onFocus={() => field.focus()}
 *      onBlur={() => field.blur()}
 *      onChange={(event) => field.setValue(event.target.value)}
 *    />
 *   );
 * }
 *
 * ```
 */
export const useField = <T = unknown, E = unknown, W = unknown>(
  path: FieldPath,
  // eslint-disable-next-line react-hooks/rules-of-hooks
  form: FormState<any, any, any, any> = useForm(),
): [FieldData<T>, Field<T>] => {
  const pathKey = formatPath(path);

  const field = React.useMemo(() => {
    return new Field<T, E, W>(path, form);
  }, [form, pathKey]);

  const data = useSubscribe(field);

  return [data, field];
};
