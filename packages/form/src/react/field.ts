import * as React from 'react';

import {Field, FieldData} from '../core/field';
import {FieldPath, FormState} from '../core/formState';
import {formatPath} from '../core/utils';

import {useForm} from './context';
import {useSubscribe} from './stateManager';

/**
 * @typeParam T - Field value type.
 */
export const useField = <T>(
  path: FieldPath,
  // eslint-disable-next-line react-hooks/rules-of-hooks
  form: FormState<any, any, any, any> = useForm(),
): [FieldData<T>, Field<T>] => {
  const pathKey = formatPath(path);

  const field = React.useMemo(() => {
    return new Field<T>(path, form);
  }, [form, pathKey]);

  const data = useSubscribe(field);

  return [data, field];
};
