import * as React from 'react';

import {
  Interface,
  State,
  STATUS_STARTED,
  STATUS_FAILED,
  STATUS_ENDED,
} from './useForm';
import useContext from './useContext';
import {set} from './util';

export interface Status<R> {
  submitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  hasErrors: boolean;
  hasSubmitErrors: boolean;
  hasWarnings: boolean;
  focused: boolean;
  touched: boolean;
  visited: boolean;
  error?: Error;
  result?: R;
}

const isEmpty = (object: any): boolean => {
  for (let _key in object) {
    return false;
  }
  return true;
};

const updateStatus = <R extends any>(
  formState: State<unknown, unknown, unknown, unknown>,
): ((status: Partial<Status<R>>) => Status<R>) => (status) => {
  let nextStatus = status;

  nextStatus = set(
    nextStatus,
    ['submitting'],
    formState.submitStatus === STATUS_STARTED,
  );
  nextStatus = set(
    nextStatus,
    ['submitFailed'],
    formState.submitStatus === STATUS_FAILED,
  );
  nextStatus = set(
    nextStatus,
    ['submitSucceeded'],
    formState.submitStatus === STATUS_ENDED,
  );
  nextStatus = set(nextStatus, ['hasErrors'], formState.errors !== null);
  nextStatus = set(
    nextStatus,
    ['hasSubmitErrors'],
    formState.submitErrors !== null,
  );
  nextStatus = set(nextStatus, ['hasWarnings'], formState.warnings !== null);

  nextStatus = set(nextStatus, ['focused'], formState.focusedPath !== null);
  nextStatus = set(nextStatus, ['touched'], !isEmpty(formState.touchedMap));
  nextStatus = set(nextStatus, ['visited'], !isEmpty(formState.visitedMap));

  nextStatus = set(nextStatus, ['error'], formState.error);
  nextStatus = set(nextStatus, ['result'], formState.result);

  return nextStatus as Status<R>;
};

export interface StatusConfig<R> {
  form?: Interface<any, R, any, any, any>;
}

const useStatus = <R extends any>({
  form = useContext<unknown, R, unknown, unknown, unknown>(),
}: StatusConfig<R> = {}): Status<R> => {
  const [status, setStatus] = React.useState(
    (): Status<R> => updateStatus<R>(form.getState())({}),
  );

  const handleFormUpdate = React.useCallback((): void => {
    setStatus(updateStatus<R>(form.getState()));
  }, [form]);

  form.useSubscription(handleFormUpdate);

  // Detect any changes in the provided form interface and update local state
  // accordingly.
  const previousFormRef = React.useRef(form);
  React.useEffect((): void => {
    if (previousFormRef.current !== form) {
      previousFormRef.current = form;
      // The next form interface is different from the current form interface.
      handleFormUpdate();
    }
  }, [form]);

  return status;
};

export default useStatus;

export interface TypedUseStatus<R> {
  (): Status<R>;
}
