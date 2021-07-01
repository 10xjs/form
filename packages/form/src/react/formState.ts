import * as React from 'react';

import {FormOptions, FormState} from '../core/formState';

/** @internal */
class OptionsProxy<VS, SD, ES, WS> {
  constructor(
    public ref: React.MutableRefObject<FormOptions<VS, SD, ES, WS>>,
  ) {}

  get onSubmit() {
    return this.ref.current.onSubmit;
  }

  get validate() {
    return this.ref.current.validate;
  }

  get warn() {
    return this.ref.current.warn;
  }
}

/**
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export const useFormState = <VS, SD = unknown, ES = undefined, WS = undefined>(
  values: VS,
  options: FormOptions<VS, SD, ES, WS>,
): FormState<VS, SD, ES, WS> => {
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  // Keep track of whether this is the first hook execution - necessary for
  // defining a "componentWillReceiveProps" behavior that ignores the initial
  // render.
  const firstRun = React.useRef(true);

  const [form] = React.useState(() => {
    return new FormState(values, new OptionsProxy(optionsRef));
  });

  // Observe updates to incoming props from which current state is derived,
  // calling any actions as necessary. These effects are ignored on first
  // render. The actions are instead applied synchronously during the state
  // initialization to avoid triggering an immediate initial re-render.
  React.useEffect((): void => {
    if (!firstRun.current) {
      // TODO Detect and warn non-memoized values.
      form.setValues(values);
    }
  }, [form, values]);

  React.useEffect((): void => {
    if (!firstRun.current) {
      // TODO Detect and warn non-memoized validate callback.
      form.runValidate();
    }
  }, [form, options.validate]);

  React.useEffect((): void => {
    if (!firstRun.current) {
      // TODO Detect and warn non-memoized validate warn callback.
      form.runWarn();
    }
  }, [form, options.warn]);

  // Update the first run flag last - any further reference to this
  // firstRun.current within this closure would receive the incorrect value.
  React.useEffect(() => {
    firstRun.current = false;
  }, []);

  return form;
};
