import {set, get, normalizeError, formatPath, parsePath, equals} from './utils';
import {StateManager} from './stateManager';
import {SubmitError, SubmitValidationError} from './errors';

/**
 * The path to a field within the form state as either a string or an array.
 *
 * ```js
 * const form = new FormState({
 *   foo: {
 *     bar: ['value'],
 *   },
 * }, ...);
 *
 * // String path
 * form.getFieldValue('foo.bar[0]'); // 'value';
 *
 * // Array path
 * form.getFieldValue(['foo', 'bar', 0]); // 'value';
 * ```
 */
export type FieldPath = string | Array<string | number>;

/**
 * This enum defines the possible states of the
 * {@link FormState | form state machine} submit sequence.
 *
 * ```mermaid
 * stateDiagram
 *   [*] --> initial
 *   initial --> submitting
 *   submitting --> ended
 *   submitting --> failed
 *   failed --> submitting
 *   ended --> submitting
 * ```
 */
export enum FormSubmitStatus {
  /**
   * The form instance has not yet been submitted.
   */
  initial = 'INITIAL',
  /**
   * The form has been submitted and is submit resolution is pending.
   */
  started = 'STARTED',
  /**
   * The form has been submitted and the immediate submit has failed.
   */
  failed = 'FAILED',
  /**
   * The form has been submitted and the immediate submit has succeeded.
   */
  ended = 'ENDED',
}

/**
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export interface FormData<VS, SD, ES, WS> {
  values: VS;
  initialValues: VS;
  pendingValues: VS;
  errors?: ES;
  warnings?: WS;
  submitErrors?: ES;
  focusedPath?: string;
  touchedMap: Record<string, boolean>;
  visitedMap: Record<string, boolean>;
  submitStatus: FormSubmitStatus;
  result?: SD;
  error?: SubmitError;
}

export type SubmitResult<SD = unknown> =
  | {ok: true; data: SD}
  | {ok: false; error: SubmitError};

export type SubmitHandler<VS, SD = unknown> = (
  values: VS,
) => // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
| void
  | undefined
  | SubmitResult<SD>
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | Promise<void | undefined | SubmitResult<SD>>;

export type ValidateHandler<VS, ES = undefined> = (
  values: VS,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => void | undefined | ES;

/**
 * Config options for the {@link FormState} class.
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export interface FormOptions<VS, SD, ES = undefined, WS = undefined> {
  /**
   * This handler is triggered by a call to the {@link FormState.submit} method
   * if all fields are currently valid and returns a
   * {@link SubmitResult | submit result} representing either a successful
   * submit or a {@link SubmitError | submit error}.
   *
   * ```js {2-5}
   * const options = {
   *   async onSubmit(values) {
   *     // process submit event...
   *     return {ok: true, data: ...};
   *   },
   * };
   * ```
   *
   * Return async submit validation errors as a failed submit result, _not_ as
   * a thrown error or rejected promise.
   *
   * ```js live noInline
   * const options = {
   *   async onSubmit(values) {
   *     // process submit event...
   *     return {ok: false, data: new SubmitValidationError({...})};
   *   },
   * };
   * ```
   */
  onSubmit: SubmitHandler<VS, SD>;

  /**
   * Run error validation on the entire value state. This handler is triggered
   * when a {@link FormState} instance is first initialized and every time the
   * value state changes. The return value is an object that matches the
   * structure of the form value state where any non-empty value at the same
   * path as a field is considered an error.
   *
   * ```js {3-6}
   * const options = {
   *   ...
   *   validate(values) {
   *     const errors {};
   *     // process validation...
   *     return errors;
   *   },
   * };
   * ```
   */
  validate?: ValidateHandler<VS, ES>;

  /**
   * Use this handler to process _soft_ validation "errors" that should not
   * block a submit event. This handler otherwise has identical behavior to
   * {@link FormOptions.validate}.
   *
   * ```js {3-6}
   * const options = {
   *   ...
   *   warn(values) {
   *     const warnings {};
   *     // process validation...
   *     return warnings;
   *   },
   * };
   * ```
   */
  warn?: ValidateHandler<VS, WS>;
}

/** @internal */
class FormConfig<VS, SD, ES = undefined, WS = undefined> {
  constructor(private readonly config: FormOptions<VS, SD, ES, WS>) {}

  get onSubmit() {
    return this.config.onSubmit;
  }

  get validate() {
    return this.config.validate ?? (() => {});
  }

  get warn() {
    return this.config.warn ?? (() => {});
  }
}

/**
 * A value passed to {@link FormState.setFieldValue}. If defined as a function
 * it will be be called with the previous value to return an updated value.
 *
 * ```js
 * const form = new FormState({name: 'name'}, ...);
 *
 * form.setFieldValue('name', 'updated');
 *
 * form.getFieldValue('name'); // 'updated'
 *
 * form.setFieldValue('name', (value) => value + ' again');
 *
 * form.getFieldValue('name'); // 'updated again'
 * ```
 *
 * @typeParam T Field value type.
 */
export type SetValueAction<T> = T | ((currentValue: T) => T);

/**
 * A class that implements the core form state machine behavior.
 *
 * @typeParam VS Type of form value state.
 * @typeParam SD Type of submit handler result.
 * @typeParam ES Type of form error state.
 * @typeParam WS Type of form warning state.
 */
export class FormState<VS, SD, ES, WS> extends StateManager<
  FormData<VS, SD, ES, WS>
> {
  private readonly _config: FormConfig<VS, SD, ES, WS>;

  /**
   * Create a new {@link FormState} instance with initial values and
   * {@link FormOptions | config options}.
   *
   * ```js
   * const form = new FormState(
   *    // Initial form values
   *    {
   *      name: '',
   *      email: '',
   *    },
   *
   *    // Form options
   *    {
   *      // Submit handler
   *      async onSubmit(values) {
   *        return {ok: true};
   *      },
   *
   *      // Error validation callback
   *      validate(values) {
   *        const errors = {};
   *
   *        if (!values.name) {
   *          errors.name = 'required;
   *        }
   *
   *        if (!values.email) {
   *          errors.email = 'required;
   *        }
   *
   *        return errors;
   *      },
   *
   *      // Warning validation callback
   *      warn(values) {
   *        const warnings = {};
   *
   *        if (!/.+\@.+\..+/.test(values.email)) {
   *          warnings.email = 'invalid email';
   *        }
   *
   *        return warnings;
   *      },
   *    },
   * );
   * ```
   *
   * @param initialValues Initial form values.
   * @param options Form options object.
   */
  constructor(initialValues: VS, options: FormOptions<VS, SD, ES, WS>) {
    const config = new FormConfig(options);

    super({
      values: initialValues,
      initialValues: initialValues,
      pendingValues: initialValues,
      errors: normalizeError(config.validate(initialValues)) ?? undefined,
      warnings: normalizeError(config.warn(initialValues)) ?? undefined,
      submitErrors: undefined,
      focusedPath: undefined,
      touchedMap: {},
      visitedMap: {},
      submitStatus: FormSubmitStatus.initial,
      result: undefined,
      error: undefined,
    });

    this._config = config;
  }

  private _set(path: Array<string | number>, value: any) {
    this._setNextState(set(this._getNextState(), path, value));
  }

  private _visitField(path: string) {
    this._set(['visitedMap', path], true);
  }

  private _touchField(path: string) {
    this._set(['touchedMap', path], true);
  }

  private _blurField(path: string) {
    const {focusedPath} = this._getNextState();

    if (focusedPath !== path) {
      if (focusedPath !== undefined) {
        // Apply implicit blur side effect of previous field.
        this._touchField(focusedPath);
        // Apply implicit focus side effect of previous field.
        this._visitField(focusedPath);
      }

      // Apply implicit focus side effect of current field.
      this._visitField(path);
    }

    this._set(['focusedPath'], undefined);

    this._touchField(path);
  }

  /**
   * Process a blur event for a given path. This clears the current focused path
   * state and sets the touched flag for that path. In the case that the current
   * focused path is not the provided path, this action applies the effects of
   * an implicit focus event before applying the blur effects. This serves as
   * backup in case a field has failed to fire a focus event, keeping the derived
   * state consistent.
   *
   * (See also: {@link focusField})
   *
   * ```js {3}
   * const form = new FormState({foo: 'bar'}, ...);
   *
   * formState.blurField('foo');
   * ```
   *
   * @param path The path to a field within the form state.
   */
  blurField(path: FieldPath) {
    this._blurField(formatPath(path));
    this._flush();
  }

  private _focusField(path: string) {
    const {focusedPath} = this._getNextState();

    if (focusedPath !== undefined && focusedPath !== path) {
      // Apply implicit blur side effect of previous field.
      this._touchField(focusedPath);
    }

    this._set(['focusedPath'], path);

    this._visitField(path);
  }

  /**
   * Process a focus event for a given path. This sets the current focus path to
   * the provided path and sets the visited flag for that path. In the case that
   * the current focused path is not undefined, this action applies the effects
   * of an implicit blur event before applying the focus effects. This serves as
   * backup in case a field has failed to fire a blur event, keeping the derived
   * state consistent.
   *
   * (See also: {@link blurField})
   *
   * ```js {3}
   * const form = new FormState({foo: 'bar'}, ...);
   *
   * formState.focusField('foo');
   * ```
   * @param path The path to a field within the form state.
   */
  focusField(path: FieldPath) {
    this._focusField(formatPath(path));
    this._flush();
  }

  private _runValidate() {
    const {values} = this._getNextState();

    const errors = normalizeError(this._config.validate(values));

    this._set(['errors'], errors);
  }

  /**
   * Update the error state with the result of the provided validate callback.
   * @param validate
   */
  runValidate() {
    this._runValidate();
    this._flush();
  }

  private _runWarn() {
    const {values} = this._getNextState();

    const warnings = normalizeError(this._config.warn(values));

    this._set(['warnings'], warnings);
  }

  /**
   * Update the warning state with the result of the provided warn callback.
   * @param warn
   */
  runWarn() {
    this._runWarn();
    this._flush();
  }

  private _setFieldValue(
    path: Array<string | number>,
    setValueAction: SetValueAction<any>,
  ) {
    const maybeDetached =
      this._getNextState().values !== this._getNextState().pendingValues;

    const currentValue = get(this._getNextState().values, path);

    const nextValue =
      typeof setValueAction === 'function'
        ? setValueAction(currentValue)
        : setValueAction;

    // Attempt to exit early if the value change is idempotent.
    if (equals(currentValue, nextValue)) {
      return;
    }

    this._set(['values', ...path], nextValue);

    this._runValidate();
    this._runWarn();

    // Keep the pending value state in sync with value changes since it
    // is the difference between the two that signifies the existence of
    // an incoming pending value.
    // TODO: Consider of this is actually the best approach. Should a change event
    // be treated as an implicit pending value rejection? Or should the rejection
    // be explicit? Considering that a consumer can see the the presence of
    // a pending value, the implicit rejection may be unnecessary and could cause
    // issues. If removed, this behavior could be added by the consumer at the
    // field level if desired.
    if (maybeDetached) {
      this._set(['pendingValues', ...path], nextValue);
    } else {
      // The pending values are equal to the values in the incoming state
      // object. Rather than updating the value within the pending value state
      // we can keep it in sync with the current value state.
      this._set(['pendingValues'], this._getNextState().values);
    }

    // TODO: Test field error behavior during submit and subsequent field change.

    // Any validation errors returned by the submit handler are
    // invalidated by any value change.
    this._set(['submitErrors'], undefined);
  }

  /**
   * Set the current value at a given path and run the provided validate and
   * warn callbacks to update the error and warning state if the value change
   * is not idempotent.
   *
   * @param path The path to a field within the form state.
   * @param setValueAction
   */
  setFieldValue(path: FieldPath, setValueAction: SetValueAction<any>): void {
    this._setFieldValue(parsePath(path), setValueAction);
    this._flush();
  }

  private _acceptPendingFieldValue(path: Array<string | number>) {
    const pendingValue = get(this._getNextState().pendingValues, path);

    this._setFieldValue(path, pendingValue);
  }

  /**
   * Set the pending value as the current value for a field.
   *
   *  (See also: {@link rejectPendingFieldValue})
   *
   * ```js {7}
   * const form = new FormState({foo: 'bar'}, {onSubmit() {...}});
   *
   * formState.setValues({foo, 'updated'});
   *
   * formState.getFieldValue('foo'); // 'bar'
   *
   * formState.acceptPendingFieldValue('foo');
   *
   * formState.getFieldValue('foo'); // 'updated'
   * ```
   *
   * @param path The path to a field within the form state.
   */
  acceptPendingFieldValue(path: FieldPath) {
    this._acceptPendingFieldValue(parsePath(path));
    this._flush();
  }

  private _rejectPendingFieldValue(path: Array<string | number>) {
    const currentValue = get(this._getNextState().values, path);

    // "Erase" pending value by overwriting it with the current
    // field value.
    this._set(['pendingValues', ...path], currentValue);
  }

  /**
   * Set the current value as the pending value for a field.
   *
   * (See also: {@link acceptPendingFieldValue})
   *
   * ```js {7}
   * const form = new FormState({foo: 'bar'}, {onSubmit() {}});
   *
   * formState.setValues({foo, 'updated'});
   *
   * formState.getPendingFieldValue('foo'); // 'updated'
   *
   * formState.rejectPendingFieldValue('foo');
   *
   * formState.getPendingFieldValue('foo'); // 'foo'
   * ```
   *
   * @param path The path to a field within the form state.
   */
  rejectPendingFieldValue(path: FieldPath) {
    this._rejectPendingFieldValue(parsePath(path));
    this._flush();
  }

  private _setValues(values: any) {
    this._set(['initialValues'], values);
    this._set(['pendingValues'], values);
  }

  /**
   * Process an incoming values prop. This action update the cached initial
   * values and pending values in the state - which will in turn update the
   * derived detached and dirty flags returned from useField.
   *
   * @param values
   */
  setValues(values: VS) {
    this._setValues(values);
    this._flush();
  }

  private _submitStarted() {
    this._set(['submitStatus'], FormSubmitStatus.started);
  }

  private _submitFailed(error?: SubmitError) {
    if (error instanceof SubmitValidationError) {
      this._set(['submitErrors'], normalizeError(error.errors));
    }

    this._set(['submitStatus'], FormSubmitStatus.failed);
    this._set(['result'], undefined);
    this._set(['error'], error);
  }

  private _submitEnded(data?: SD) {
    this._set(['submitStatus'], FormSubmitStatus.ended);
    this._set(['result'], data);
    this._set(['error'], undefined);
  }

  /**
   * Submit the current form values by calling the configured submit callback.
   *
   * @param submitEnded
   * @param submitError
   * @returns A promise that resolves when the submit sequence is complete.
   */
  submit() {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return new Promise<void | undefined | SubmitResult<SD>>((resolve) => {
      const {submitStatus, errors, values} = this._getNextState();

      if (submitStatus === FormSubmitStatus.started) {
        // Abort submit if a previous submit is still in progress.
        return resolve(undefined);
      }

      this._submitStarted();

      if (errors !== undefined) {
        return resolve({ok: false, error: new SubmitValidationError(errors)});
      }

      return resolve(this._config.onSubmit(values));
    })
      .then((result) => {
        if (result === undefined) {
          this._submitEnded();
        } else if (result.ok) {
          this._submitEnded(result.data);
        } else {
          this._submitFailed(result.error);
        }

        this._flush();
      })
      .catch((error: unknown) => {
        this._submitFailed();

        this._flush();

        throw error;
      });
  }

  getSubmitStatus() {
    return this.getState().submitStatus;
  }

  /**
   * Get the current error validation state. This method returns the most recent
   * value returned from {@link FormOptions.validate}.
   *
   * See [validation](../../validation.md).
   *
   * ```js {9}
   * const form = new FormState({}, {
   *   onSubmit(values) {
   *     return {ok: false,  error: new SubmitValidationError({...})};
   *   }
   * };
   *
   * await form.submit();
   *
   * form.getError(); // SubmitValidationError
   * ```
   */
  getErrors() {
    return this.getState().errors;
  }

  /**
   * Get the current warning validation state. This method returns the most
   * recent value returned from {@link FormOptions.validate}.
   */
  getSubmitErrors() {
    return this.getState().submitErrors;
  }

  /**
   * Get the current warning validation state. This method returns the most
   * recent value returned from {@link FormOptions.warn}.
   */
  getWarnings() {
    return this.getState().warnings;
  }

  /**
   * Get the current submit error.
   *
   * ```js {9}
   * const form = new FormState({}, {
   *   async onSubmit(values) {
   *     return {ok: false,  error: new SubmitValidationError({...})};
   *   }
   * };
   *
   * await form.submit();
   *
   * form.getError(); // SubmitValidationError
   * ```
   */
  getError() {
    return this.getState().error;
  }

  getResult() {
    return this.getState().result;
  }

  isFieldFocused(path: FieldPath) {
    return this.getState().focusedPath === formatPath(path);
  }

  isFieldVisited(path: FieldPath) {
    return Boolean(get(this.getState().visitedMap, [formatPath(path)]));
  }

  isFieldTouched(path: FieldPath) {
    return Boolean(get(this.getState().touchedMap, [formatPath(path)]));
  }

  getFieldValue(path: FieldPath): any {
    return get(this.getState().values, parsePath(path));
  }

  getPendingFieldValue(path: FieldPath): any {
    return get(this.getState().pendingValues, parsePath(path));
  }

  getInitialFieldValue(path: FieldPath): any {
    return get(this.getState().initialValues, parsePath(path));
  }

  getFieldError(path: FieldPath): any {
    if (this.getState().submitErrors !== undefined) {
      const submitError = normalizeError(
        get(this.getState().submitErrors, parsePath(path)),
      );

      if (submitError !== undefined) {
        return submitError;
      }
    }

    if (this.getState().errors !== undefined) {
      return normalizeError(get(this.getState().errors, parsePath(path)));
    }

    return undefined;
  }

  getFieldWarning(path: FieldPath): any {
    if (this.getState().warnings !== undefined) {
      return normalizeError(get(this.getState().warnings, parsePath(path)));
    }

    return undefined;
  }
}
