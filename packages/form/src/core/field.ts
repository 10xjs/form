import {FieldPath, FormState, SetValueAction} from './formState';
import {StateManager, Subscription} from './stateManager';
import {set} from './utils';

/**
 * @typeParam T - Field value type.
 */
export interface FieldData<T> {
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
   * The current value of the field.
   */
  value: T;
  /**
   * The initial value set set by an update to the root form value state.
   */
  initialValue: T;
  /**
   * The pending value set set by an update to the root form value state.
   */
  pendingValue: T;
  /**
   * True if the current value is different from the initial value.
   */
  dirty: boolean;
  /**
   * True if the current value is different from the pending value.
   */
  detached: boolean;
  /**
   * The current field error value.
   */
  error: unknown;
  /**
   * The current field warning value.
   */
  warning: unknown;
}

/**
 * @typeParam T - Field value type.
 */
export class Field<T> extends StateManager<FieldData<T>> {
  private _subscription?: Subscription;

  public readonly path: FieldPath;

  public readonly form: FormState<any, any, any, any>;

  constructor(path: FieldPath, form: FormState<any, any, any, any>) {
    const getState = (state: Partial<FieldData<T>>) => {
      let nextState = state;

      const value = form.getFieldValue(path);
      const initialValue = form.getInitialFieldValue(path);
      const pendingValue = form.getPendingFieldValue(path);

      nextState = set(nextState, ['focused'], form.isFieldFocused(path));
      nextState = set(nextState, ['visited'], form.isFieldVisited(path));
      nextState = set(nextState, ['touched'], form.isFieldTouched(path));
      nextState = set(nextState, ['dirty'], form.isFieldDirty(path));
      nextState = set(nextState, ['detached'], form.isFieldDetached(path));

      nextState = set(nextState, ['value'], value);
      nextState = set(nextState, ['initialValue'], initialValue);
      nextState = set(nextState, ['pendingValue'], pendingValue);

      nextState = set(nextState, ['error'], form.getFieldError(path));
      nextState = set(nextState, ['warning'], form.getFieldWarning(path));

      return nextState as FieldData<T>;
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

    this.path = path;
    this.form = form;
  }

  focus() {
    this.form.focusField(this.path);
  }

  blur() {
    this.form.blurField(this.path);
  }

  setValue(setValueAction: SetValueAction<T>) {
    this.form.setFieldValue(this.path, setValueAction);
  }

  acceptPendingValue(resolve?: (value: T, pendingValue: T) => T) {
    this.form.acceptPendingFieldValue(this.path, resolve);
  }

  rejectPendingValue() {
    this.form.rejectPendingFieldValue(this.path);
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
   * The current value of the field.
   */
  getValue() {
    return this.getState().value;
  }

  /**
   * The initial value set set by an update to the root form value state.
   */
  getInitialValue() {
    return this.getState().initialValue;
  }

  /**
   * The pending value set set by an update to the root form value state.
   */
  getPendingValue() {
    return this.getState().pendingValue;
  }

  /**
   * The current field error value.
   */
  getError() {
    return this.getState().error;
  }

  /**
   * The current field warning value.
   */
  getWarning() {
    return this.getState().warning;
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
