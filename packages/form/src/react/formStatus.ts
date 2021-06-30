import * as React from 'react';

import {FormStatus, FormStatusData} from '../core/formStatus';

import {useForm} from './context';
import {useSubscribe} from './stateManager';

/**
 * @typeParam SD Type of submit handler result.
 */
export const useFormStatus = <SD>(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  form = useForm(),
): [FormStatusData<SD>, FormStatus<SD>] => {
  const status = React.useMemo(() => {
    return new FormStatus<SD>(form);
  }, [form]);

  const data = useSubscribe(status);

  return [data, status];
};
