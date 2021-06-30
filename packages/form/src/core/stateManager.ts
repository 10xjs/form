/**
 * @packageDocumentation
 * @internal
 */

import {equals} from './utils';

export interface Subscription {
  unsubscribe: () => void;
}

export interface Subscribable<T> {
  subscribe: (subscriber: () => void) => Subscription;
  getState: () => T;
}

export class StateManager<T> implements Subscribable<T> {
  private _state: T;
  private _nextState: T;
  private readonly _subscribers: Array<() => void> = [];
  private readonly _onStart?: () => void;
  private readonly _onPause?: () => void;

  constructor(state: T, onStart?: () => void, onPause?: () => void) {
    this._onStart = onStart;
    this._onPause = onPause;
    this._state = state;
    this._nextState = state;
  }

  subscribe(subscriber: () => void) {
    if (this._subscribers.length === 0 && this._onStart !== undefined) {
      this._onStart();
    }

    this._subscribers.push(subscriber);

    return {
      unsubscribe: () => {
        const index = this._subscribers.indexOf(subscriber);

        if (index !== -1) {
          this._subscribers.splice(index, 1);

          if (this._subscribers.length === 0 && this._onPause !== undefined) {
            this._onPause();
          }
        }
      },
    };
  }

  getState() {
    return this._state;
  }

  protected _getNextState() {
    return this._nextState;
  }

  protected _setNextState(state: T) {
    this._nextState = state;
  }

  protected _flush() {
    if (equals(this._nextState, this._state)) {
      return;
    }

    this._state = this._nextState;

    this._subscribers.forEach((subscriber) => {
      subscriber();
    });
  }
}
