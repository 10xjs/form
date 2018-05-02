// @flow

import {
  insert,
  remove,
  equals,
  set,
  get,
  parsePath,
  formatPath,
  matchesDeep,
  createIsEvent,
  createCastEvent,
  createMergeHandlers,
  createParseEvent,
  lazyUpdate,
} from '../util';

class MockHTMLInputElement {
  value: string | void;
  checked: boolean | void;
  type: string | void;

  constructor(config: {value?: string, checked?: boolean, type?: string} = {}) {
    this.value = config.value;
    this.checked = config.checked;
    this.type = config.type;
  }
}

class MockEvent {
  defaultPrevented: boolean;
  target: mixed;

  constructor(target: mixed) {
    this.defaultPrevented = false;
    this.target = target;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
}

const isEvent = createIsEvent(MockEvent);
const castEvent = createCastEvent(MockEvent);
const mergeHandlers = createMergeHandlers(MockEvent);
const parseEvent = createParseEvent(MockEvent, MockHTMLInputElement);

describe('utils', () => {
  describe('insert', () => {
    it('should insert a value at the correct index', () => {
      const result = insert([1, 2, 3, 4], 2, null);

      expect(result).toEqual([1, 2, null, 3, 4]);
    });

    it('should throw if the array argument is invalid', () => {
      expect(() => {
        // $ExpectError 'array' is an invalid argument
        insert('array', 2, null);
      }).toThrow();
    });

    it('should throw if the index argument is invalid', () => {
      expect(() => {
        // $ExpectError '2' is an invalid argument
        insert([1, 2, 3, 4], '2', null);
      }).toThrow();

      expect(() => {
        insert([1, 2, 3, 4], 2.5, null);
      }).toThrow();
    });

    it('should throw if the index argument is out of bounds', () => {
      expect(() => {
        insert([1, 2, 3, 4], -1, null);
      }).toThrow();

      expect(() => {
        insert([1, 2, 3, 4], 5, null);
      }).toThrow();
    });
  });

  describe('remove', () => {
    it('should remove the value at the correct index', () => {
      const result = remove([1, 2, 3, 4], 2);

      expect(result).toEqual([1, 2, 4]);
    });

    it('should throw if the array argument is invalid', () => {
      expect(() => {
        // $ExpectError 'array' is an invalid argument
        remove('array', 2);
      }).toThrow();
    });

    it('should throw if the index argument is invalid', () => {
      expect(() => {
        // $ExpectError '2' is an invalid argument
        remove([1, 2, 3, 4], '2');
      }).toThrow();

      expect(() => {
        remove([1, 2, 3, 4], 2.5);
      }).toThrow();
    });

    it('should throw if the index argument is out of bounds', () => {
      expect(() => {
        remove([1, 2, 3, 4], -1);
      }).toThrow();

      expect(() => {
        remove([1, 2, 3, 4], 4);
      }).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true if values are equal', () => {
      expect(equals(null, null)).toEqual(true);

      expect(equals(NaN, NaN)).toEqual(true);

      expect(equals(new Date(10), new Date(10))).toEqual(true);
    });

    it('should not consider mutually falsy values equal', () => {
      expect(equals(null, undefined)).toEqual(false);
    });
  });

  describe('set', () => {
    it('should set a value at the correct path', () => {
      const state = {foo: {bar: [1, 2, 3, {foo: 'bar'}]}};

      expect(set(state, [], null)).toEqual(null);

      expect(set(state, ['foo'], null)).toEqual({...state, foo: null});

      expect(set(state, ['foo', 'foo'], null)).toEqual({
        ...state,
        foo: {...state.foo, foo: null},
      });

      expect(set(state, ['foo', 'bar', 0], null)).toEqual({
        ...state,
        foo: {...state.foo, bar: [null, ...state.foo.bar.slice(1)]},
      });

      expect(set(state, ['foo', 'bar', 3, 'foo'], null)).toEqual({
        ...state,
        foo: {
          ...state.foo,
          bar: state.foo.bar
            .slice(0, -1)
            .concat([{...state.foo.bar[3], foo: null}]),
        },
      });

      expect(set({}, ['foo', 'bar', 0, 'foo'], null)).toEqual({
        foo: {bar: [{foo: null}]},
      });
    });

    it('should not mutate the input value', () => {
      const state = {foo: true};

      set(state, ['foo'], false);
      expect(state.foo).toEqual(true);

      const array = [1, 2, 3];

      set(array, [0], 0);
      expect(array[0]).toEqual(1);
    });

    it('should not create a new value if the update is idempotent', () => {
      const state = {foo: {bar: [1, 2, 3], foo: null}};

      expect(set(state, ['foo', 'foo'], null)).toBe(state);
      expect(set(state, ['foo', 'bar', 0], 1)).toBe(state);
    });

    it('should throw if the path is not a valid array', () => {
      expect(() => {
        // $ExpectError 'path' is an invalid argument
        set({}, 'path', null);
      }).toThrow('invalid path. expected array');

      expect(() => {
        // $ExpectError [null] is an invalid argument
        set({}, [null], null);
      }).toThrow('invalid path. expected string or int');
    });

    it('should throw if the path does not match the object shape', () => {
      expect(() => {
        set({}, [0], null);
      }).toThrow('expected array');

      expect(() => {
        set([], ['0'], null);
      }).toThrow('expected int');
    });
  });

  describe('get', () => {
    it('should return the correct value at a path', () => {
      const state = {foo: {bar: [1, 2, 3, {foo: 'bar'}]}};

      expect(get(state, [])).toBe(state);

      expect(get(state, ['foo'])).toBe(state.foo);

      expect(get(state, ['foo', 'foo', 'foo', 'foo'])).toEqual(undefined);

      expect(get(state, ['foo', 'bar', 0])).toEqual(state.foo.bar[0]);

      expect(get(state, ['foo', 'bar', 3, 'foo'])).toEqual(
        state.foo.bar[3].foo,
      );
    });

    it('should throw if the path is not a valid array', () => {
      expect(() => {
        // $ExpectError 'path' is an invalid argument
        get({}, 'path');
      }).toThrow('invalid path. expected array');

      expect(() => {
        // $ExpectError [null] is an invalid argument
        get({}, [null]);
      }).toThrow('invalid path. expected string or int');
    });

    it('should throw if the path does not match the object shape', () => {
      expect(() => {
        get({}, [0]);
      }).toThrow('expected array');

      expect(() => {
        get([], ['0']);
      }).toThrow('expected int');
    });
  });

  describe('parsePath', () => {
    it('should convert a path string to an array', () => {
      expect(parsePath('')).toEqual([]);

      expect(parsePath('foo')).toEqual(['foo']);

      expect(parsePath('foo.bar')).toEqual(['foo', 'bar']);

      expect(parsePath('foo.bar[3].foo')).toEqual(['foo', 'bar', 3, 'foo']);

      expect(parsePath('[0]')).toEqual([0]);

      expect(parsePath('[0][1][2]')).toEqual([0, 1, 2]);
    });

    it('should return the passed value if it is an array', () => {
      const path = [0, 1, 2];

      expect(parsePath(path)).toBe(path);
    });

    it('should throw an error if the provided path is invalid', () => {
      expect(() => {
        parsePath('foo.bar[3.foo');
      }).toThrow('invalid path. syntax error');

      expect(() => {
        // $ExpectError null is an invalid argument
        parsePath(null);
      }).toThrow('invalid path. expected array or string');
    });
  });

  describe('formatPath', () => {
    it('should convert a path array to a string', () => {
      expect(formatPath([])).toEqual('');

      expect(formatPath(['foo'])).toEqual('foo');

      expect(formatPath(['foo', 'bar'])).toEqual('foo.bar');

      expect(formatPath(['foo', 'bar', 3, 'foo'])).toEqual('foo.bar[3].foo');

      expect(formatPath([0])).toEqual('[0]');

      expect(formatPath([0, 1, 2])).toEqual('[0][1][2]');
    });

    it('should return the passed value if it is a string', () => {
      const path = '[0][1][2]';

      expect(formatPath(path)).toBe(path);
    });

    it('should throw an error if the provided path is invalid', () => {
      expect(() => {
        // $ExpectError null is an invalid argument
        formatPath(null);
      }).toThrow('invalid path. expected array or string');
    });
  });

  describe('matchesDeep', () => {
    it('should return true if a matching branch is found', () => {
      const test = (value) => value === null;

      expect(matchesDeep(null, test)).toEqual(true);

      expect(matchesDeep(undefined, test)).toEqual(false);

      expect(matchesDeep({foo: undefined}, test)).toEqual(false);

      expect(matchesDeep([null], test)).toEqual(true);

      expect(matchesDeep([undefined], test)).toEqual(false);

      expect(matchesDeep({foo: [{bar: null}]}, test)).toEqual(true);

      expect(matchesDeep({foo: [{bar: undefined}]}, test)).toEqual(false);
    });

    it('should ignore prototype properties', () => {
      const test = (value) => value === null;

      const val = Object.create({foo: null});

      expect(matchesDeep(val, test)).toEqual(false);
    });
  });

  describe('isEvent', () => {
    it('should return true if the value is an Event or SyntheticEvent', () => {
      expect(isEvent(new MockEvent())).toEqual(true);
      expect(isEvent(new class SyntheticEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticAnimationEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticCompositionEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticInputEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticUIEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticFocusEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticKeyboardEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticMouseEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticDragEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticWheelEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticTouchEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticTransitionEvent {}())).toEqual(true);

      expect(isEvent(new class SomeInvalidEvent {}())).toEqual(false);
      expect(isEvent({constructor: null})).toEqual(false);
      expect(isEvent(null)).toEqual(false);
    });
  });

  describe('castEvent', () => {
    expect(castEvent(new MockEvent()) instanceof MockEvent).toEqual(true);
    expect(castEvent(new class SomeInvalidEvent {}())).toEqual(null);
  });

  describe('mergeHandlers', () => {
    it('should call merged handlers', () => {
      const handlerA = jest.fn();
      const handlerB = jest.fn();
      const handlerC = jest.fn();

      const mergedHandlerA = mergeHandlers(handlerA, handlerB);
      const mergedHandlerB = mergeHandlers(undefined, handlerC);

      const event = new MockEvent();

      mergedHandlerA(event);
      mergedHandlerB(event);

      expect(handlerA.mock.calls.length).toEqual(1);
      expect(handlerA.mock.calls[0][0]).toBe(event);

      expect(handlerB.mock.calls.length).toEqual(1);
      expect(handlerB.mock.calls[0][0]).toBe(event);

      expect(handlerC.mock.calls.length).toEqual(1);
      expect(handlerC.mock.calls[0][0]).toBe(event);
    });

    it('should abort if default is prevented', () => {
      const handlerA = jest.fn(
        (event) => event instanceof MockEvent && event.preventDefault(),
      );
      const handlerB = jest.fn();

      const mergedHandler = mergeHandlers(handlerA, handlerB);

      const event = new MockEvent();

      mergedHandler(event);

      expect(handlerA.mock.calls.length).toEqual(1);
      expect(handlerA.mock.calls[0][0]).toBe(event);

      expect(handlerB.mock.calls.length).toEqual(0);
    });
  });

  describe('parseEvent', () => {
    it('should return non Event instances', () => {
      expect(parseEvent(null)).toEqual(null);
    });

    it('should return the value of a plain event target', () => {
      const event = new MockEvent(new MockHTMLInputElement({value: 'foo'}));

      expect(parseEvent(event)).toEqual('foo');
    });

    it('should return the checked property of a checkbox event target', () => {
      const event = new MockEvent(
        new MockHTMLInputElement({type: 'checkbox', checked: true}),
      );

      expect(parseEvent(event)).toEqual(true);
    });

    it('should return `undefined` with an invalid event target', () => {
      const event = new MockEvent({value: 'foo'});

      expect(parseEvent(event)).toEqual(undefined);
    });
  });

  describe('lazyUpdate', () => {
    it('should return null if the update shallow equals the state', () => {
      const state = {foo: {foo: 'bar'}, bar: {bar: 'foo'}};

      const update1 = {foo: state.foo};
      const update2 = {foo: {...state.foo}};

      expect(lazyUpdate(state, update1)).toEqual(null);
      expect(lazyUpdate(state, update2)).toEqual(update2);
    });
  });

  describe('lazyUpdate', () => {
    it('should ignore prototype properties', () => {
      const state = {foo: {foo: 'bar'}};

      const update = Object.create({foo: state.foo});

      expect(lazyUpdate(state, update)).toEqual(null);
    });
  });
});
