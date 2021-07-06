import {StateManager, Subscription} from './stateManager';

import {Field} from './field';
import {set} from './utils';

export interface FieldStatusData {
  /**
   * True if the field is currently focused.
   */
  focused: boolean;
  /**
   * True if the field is has been or is currently focused.
   */
  visited: boolean;
  /**
   * True if the field value has been edited.
   */
  touched: boolean;
  /**
   * True if the current value is different from the initial value.
   */
  dirty: boolean;
  /**
   * True if the current value is different from the pending value.
   */
  detached: boolean;
  /**
   * True if the field has an error value.
   */
  hasError: boolean;
  /**
   * True if the field has a warning value.
   */
  hasWarning: boolean;
}

export class FieldStatus extends StateManager<FieldStatusData> {
  private _subscription?: Subscription;

  public readonly field: Field;

  constructor(field: Field) {
    const getState = (state: Partial<FieldStatusData>) => {
      let nextState = state;

      nextState = set(nextState, ['focused'], field.isFocused);
      nextState = set(nextState, ['visited'], field.isVisited);
      nextState = set(nextState, ['touched'], field.isTouched);
      nextState = set(nextState, ['dirty'], field.isDirty);
      nextState = set(nextState, ['detached'], field.isDetached);

      nextState = set(nextState, ['hasError'], field.getError !== null);
      nextState = set(nextState, ['hasWarning'], field.getWarning !== null);

      return nextState as FieldStatusData;
    };

    super(
      getState({}),
      () => {
        this._subscription = field.subscribe(() => {
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

    this.field = field;
  }

  /**
   * True if the field is currently focused.
   */
  isFocused() {
    return this.getState().focused;
  }

  /**
   * True if the field is has been or is currently focused.
   */
  isVisited() {
    return this.getState().visited;
  }

  /**
   * True if the field value has been edited.
   */
  isTouched() {
    return this.getState().touched;
  }

  /**
   * The current field error value.
   */
  hasError() {
    return this.getState().hasError;
  }

  /**
   * The current field warning value.
   */
  hasWarning() {
    return this.getState().hasWarning;
  }

  /**
   * True if the current value is different from the initial value.
   */
  isDirty() {
    return this.getState().dirty;
  }

  /**
   * True if the current value is different from the pending value.
   */
  isDetached() {
    return this.getState().detached;
  }
}
