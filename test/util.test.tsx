import {
  pathError,
  pathSyntaxError,
  arrayTargetError,
  emptyPathError,
  indexError,
  boundsError,
  pathArrayError,
  expectedArrayError,
  expectedPathIntError,
  pathPartError,
  isValidPath,
  insert,
  remove,
  equals,
  set,
  setWith,
  get,
  parsePath,
  formatPath,
  matchesDeep,
  isEvent,
  mergeHandlers,
  parseEvent,
} from '../src/util';

class HTMLMockElement {
  public value: string | void;
  public checked: boolean | void;
  public type: string | void;

  public constructor(
    config: {value?: string; checked?: boolean; type?: string} = {},
  ) {
    this.value = config.value;
    this.checked = config.checked;
    this.type = config.type;
  }
}

class MockEvent<T> {
  public defaultPrevented: boolean;
  public target: T;

  public constructor(target: T) {
    this.defaultPrevented = false;
    this.target = target;
  }
  public preventDefault() {
    this.defaultPrevented = true;
  }
  public stopPropagation() {}
}

describe('utils', () => {
  describe('emptyPathError', () => {
    it('should return a string', () => {
      expect(typeof emptyPathError()).toBe('string');
    });
  });
  describe('isValidPath', () => {
    it('should return true if the provided path is valid', () => {
      expect(isValidPath([])).toEqual(false);

      expect(isValidPath(['foo'])).toEqual(true);

      expect(isValidPath('')).toEqual(false);

      expect(isValidPath('foo')).toEqual(true);

      expect(isValidPath(null)).toEqual(false);
    });
  });
  describe('insert', () => {
    it('should insert a value at the correct index', () => {
      const result = insert([1, 2, 3, 4], 2, null);

      expect(result).toEqual([1, 2, null, 3, 4]);
    });

    it('should throw if the array argument is invalid', () => {
      expect(() => {
        // @ts-ignore 'array' is an invalid argument
        insert('array', 2, null);
      }).toThrow(arrayTargetError());
    });

    it('should throw if the index argument is invalid', () => {
      expect(() => {
        // @ts-ignore '2' is an invalid argument
        insert([1, 2, 3, 4], '2', null);
      }).toThrow(indexError());

      expect(() => {
        insert([1, 2, 3, 4], 2.5, null);
      }).toThrow(indexError());
    });

    it('should throw if the index argument is out of bounds', () => {
      expect(() => {
        insert([1, 2, 3, 4], -1, null);
      }).toThrow(boundsError());

      expect(() => {
        insert([1, 2, 3, 4], 5, null);
      }).toThrow(boundsError());
    });
  });

  describe('remove', () => {
    it('should remove the value at the correct index', () => {
      const result = remove([1, 2, 3, 4], 2);

      expect(result).toEqual([1, 2, 4]);
    });

    it('should throw if the array argument is invalid', () => {
      expect(() => {
        // @ts-ignore 'array' is an invalid argument
        remove('array', 2);
      }).toThrow(arrayTargetError());
    });

    it('should throw if the index argument is invalid', () => {
      expect(() => {
        // @ts-ignore '2' is an invalid argument
        remove([1, 2, 3, 4], '2');
      }).toThrow(indexError());

      expect(() => {
        remove([1, 2, 3, 4], 2.5);
      }).toThrow(indexError());
    });

    it('should throw if the index argument is out of bounds', () => {
      expect(() => {
        remove([1, 2, 3, 4], -1);
      }).toThrow(boundsError());

      expect(() => {
        remove([1, 2, 3, 4], 4);
      }).toThrow(boundsError());
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

      expect(formatPath(path)).toEqual(path);
    });

    it('should throw an error if the provided path is invalid', () => {
      expect(() => {
        // @ts-ignore null is an invalid argument
        formatPath(null);
      }).toThrow(pathError());
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
        parsePath('foo.bar[3]3.foo');
      }).toThrow(pathSyntaxError('foo.bar[3]3'));

      expect(() => {
        // @ts-ignore null is an invalid argument
        parsePath(null);
      }).toThrow(pathError());
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
            .concat([Object.assign({}, state.foo.bar[3], {foo: null})]),
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
        // @ts-ignore 'path' is an invalid argument
        set({}, 'path', null);
      }).toThrow(pathArrayError());

      expect(() => {
        // @ts-ignore [null] is an invalid argument
        set({}, [null], null);
      }).toThrow(pathPartError([null], false));

      expect(() => {
        // @ts-ignore [null] is an invalid argument
        set({}, [null, null], null);
      }).toThrow(pathPartError([null], true));
    });

    it('should throw if the path does not match the object shape', () => {
      expect(() => {
        set({}, [0], null);
      }).toThrow(expectedArrayError({}, [0], false));

      expect(() => {
        set({}, [0, 1], null);
      }).toThrow(expectedArrayError({}, [0], true));

      expect(() => {
        set([], ['0'], null);
      }).toThrow(expectedPathIntError(['0'], false));

      expect(() => {
        set([], ['0', 1], null);
      }).toThrow(expectedPathIntError(['0'], true));
    });
  });

  describe('setWith', () => {
    it('should set a value using an updater at the correct path', () => {
      const state = {foo: {bar: [1, 2, 3, {foo: 'bar'}]}};

      const updater = jest.fn(() => null);

      expect(setWith(state, ['foo', 'bar', 3, 'foo'], updater)).toEqual({
        ...state,
        foo: {
          ...state.foo,
          bar: [
            ...state.foo.bar.slice(0, 3),
            Object.assign({}, state.foo.bar[3], {foo: null}),
          ],
        },
      });

      expect(updater.mock.calls.length).toBe(1);
      expect((updater as any).mock.calls[0][0]).toBe('bar');
    });
  });

  describe('get', () => {
    it('should return the correct value at a path', () => {
      const state = {foo: {bar: [1, 2, 3, {foo: 'bar'}]}};

      expect(get(state, [])).toBe(state);

      expect(get(state, ['foo'])).toBe(state.foo);

      expect(get(state, ['foo', 'foo', 'foo', 'foo'])).toEqual(undefined);

      expect(get(state, ['foo', 'bar', 0])).toEqual(state.foo.bar[0]);

      expect(get(state, ['foo', 'bar', 3, 'foo'])).toEqual('bar');
    });

    it('should throw if the path is not a valid array', () => {
      expect(() => {
        // @ts-ignore 'path' is an invalid argument
        get({}, 'path');
      }).toThrow(pathArrayError());

      expect(() => {
        // @ts-ignore [null] is an invalid argument
        get({}, [null]);
      }).toThrow(pathPartError([null], false));

      expect(() => {
        // @ts-ignore [null] is an invalid argument
        get({}, [null, null]);
      }).toThrow(pathPartError([null], true));
    });

    it('should throw if the path does not match the object shape', () => {
      expect(() => {
        get({}, [0]);
      }).toThrow(expectedArrayError({}, [0], false));

      expect(() => {
        get({}, [0, 1]);
      }).toThrow(expectedArrayError({}, [0], true));

      expect(() => {
        get([], ['0']);
      }).toThrow(expectedPathIntError(['0'], false));

      expect(() => {
        get([], ['0', 1]);
      }).toThrow(expectedPathIntError(['0'], true));
    });
  });

  describe('matchesDeep', () => {
    it('should return true if a matching branch is found', () => {
      const test = (value: unknown) => value === null;

      expect(matchesDeep(null, test)).toEqual(true);

      expect(matchesDeep(undefined, test)).toEqual(false);

      expect(matchesDeep({foo: undefined}, test)).toEqual(false);

      expect(matchesDeep([null], test)).toEqual(true);

      expect(matchesDeep([undefined], test)).toEqual(false);

      expect(matchesDeep({foo: [{bar: null}]}, test)).toEqual(true);

      expect(matchesDeep({foo: [{bar: undefined}]}, test)).toEqual(false);
    });

    it('should ignore prototype properties', () => {
      const test = (value: unknown) => value === null;

      const val = Object.create({foo: null});

      expect(matchesDeep(val, test)).toEqual(false);
    });
  });

  describe('isEvent', () => {
    it('should return true if the value is an Event or SyntheticEvent', () => {
      expect(isEvent(new MockEvent(new HTMLMockElement()))).toEqual(true);
      expect(isEvent({constructor: null})).toEqual(false);
      expect(isEvent(null)).toEqual(false);
    });
  });

  describe('mergeHandlers', () => {
    it('should call merged handlers', () => {
      const handlerA = jest.fn();
      const handlerB = jest.fn();
      const handlerC = jest.fn();

      const mergedHandlerA = mergeHandlers(handlerA, handlerB);
      const mergedHandlerB = mergeHandlers(undefined, handlerC);

      const event = new MockEvent(new HTMLMockElement());

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

      const event = new MockEvent(new HTMLMockElement());

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
      const event = new MockEvent(new HTMLMockElement({value: 'foo'}));

      expect(parseEvent(event)).toEqual('foo');
    });

    it('should return the checked property of a checkbox event target', () => {
      const event = new MockEvent(
        new HTMLMockElement({type: 'checkbox', checked: true}),
      );

      expect(parseEvent(event)).toEqual(true);
    });
  });
});
