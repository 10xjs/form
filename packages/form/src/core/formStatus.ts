import {SubmitError} from './errors';
import {FormState, FormSubmitStatus} from './formState';
import {StateManager, Subscription} from './stateManager';
import {set} from './utils';

export interface FormStatusData<SR> {
  /**
   * True if the form has been submitted and is submit resolution is pending.
   */
  submitting: boolean;
  /**
   * True if the form has been submitted and the immediate submit has failed.
   */
  submitFailed: boolean;
  /**
   * True if the form has been submitted and the immediate submit has succeeded.
   */
  submitSucceeded: boolean;
  /**
   * True if any field validation errors currently exist.
   */
  hasErrors: boolean;
  /**
   * True if any field submit validation errors currently exist.
   */
  hasSubmitErrors: boolean;
  /**
   * True if any field validation warnings currently exist.
   */
  hasWarnings: boolean;
  /**
   * Submit result error.
   */
  error: SubmitError | null;
  /**
   * Submit result.
   */
  result: SR | null;
}

/**
 * @typeParam SR - Type of submit handler result.
 */
export class FormStatus<SR> extends StateManager<FormStatusData<SR>> {
  private _subscription?: Subscription;

  public readonly form: FormState<any, any, any, any>;

  constructor(form: FormState<any, any, any, any>) {
    const getState = (state: Partial<FormStatusData<SR>> = {}) => {
      let nextState = state;

      nextState = set(
        nextState,
        ['submitting'],
        form.getSubmitStatus() === FormSubmitStatus.started,
      );
      nextState = set(
        nextState,
        ['submitFailed'],
        form.getSubmitStatus() === FormSubmitStatus.failed,
      );
      nextState = set(
        nextState,
        ['submitSucceeded'],
        form.getSubmitStatus() === FormSubmitStatus.ended,
      );
      nextState = set(nextState, ['hasErrors'], form.getErrors() !== undefined);
      nextState = set(
        nextState,
        ['hasSubmitErrors'],
        form.getSubmitErrors() !== undefined,
      );
      nextState = set(
        nextState,
        ['hasWarnings'],
        form.getWarnings() !== undefined,
      );

      nextState = set(nextState, ['error'], form.getError());
      nextState = set(nextState, ['result'], form.getResult());

      return nextState as FormStatusData<SR>;
    };
    super(
      getState({}),
      () => {
        this._subscription = form.subscribe(() => {
          this._setNextState(getState(this._getNextState()));
          this._flush();
        });
      },
      () => {
        if (this._subscription !== undefined) {
          this._subscription.unsubscribe();
          this._subscription = undefined;
        }
      },
    );

    this.form = form;
  }
}
