/**
 * @packageDocumentation
 * @internal
 */

import * as React from 'react';

import {Subscribable} from '../core/stateManager';

export function useSubscribe<TValue>(subject: Subscribable<TValue>) {
  const [state, setState] = React.useState(() => subject.getState());

  React.useDebugValue(state);

  React.useEffect(() => {
    const subscription = subject.subscribe(() => {
      setState(subject.getState());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);

  return state;
}
