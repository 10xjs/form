import * as React from 'react';
import {Field} from '../core/field';

import {FieldStatus, FieldStatusData} from '../core/fieldStatus';
import {FieldPath, FormState} from '../core/formState';
import {formatPath} from '../core/utils';

import {useForm} from './context';
import {useSubscribe} from './stateManager';

export const useFieldStatus = (
  path: FieldPath,
  // eslint-disable-next-line react-hooks/rules-of-hooks
  form: FormState<any, any, any, any> = useForm(),
): [FieldStatusData, FieldStatus] => {
  const status = React.useMemo(() => {
    const field = new Field(path, form);
    return new FieldStatus(field);
  }, [form, formatPath(path)]);

  const data = useSubscribe(status);

  return [data, status];
};
