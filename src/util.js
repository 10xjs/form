// @flow strict

// flowlint unclear-type:off

const isInt = (val: mixed): boolean %checks => {
  return typeof val === 'number' && val === (val | 0);
};

export const insert = <T>(
  array: Array<T>,
  index: number,
  value: T,
): Array<T> => {
  if (!Array.isArray(array)) {
    throw new TypeError('expected array');
  }

  if (!isInt(index)) {
    throw new TypeError('expected integer');
  }

  if (index < 0 || index > array.length) {
    throw new Error('index out of bounds');
  }

  return array.slice(0, index).concat([value], array.slice(index));
};

export const remove = <T>(array: Array<T>, index: number): Array<T> => {
  if (!Array.isArray(array)) {
    throw new TypeError('expected array');
  }

  if (!isInt(index)) {
    throw new TypeError('expected integer');
  }

  if (index < 0 || index >= array.length) {
    throw new Error('index out of bounds');
  }

  return array.slice(0, index).concat(array.slice(index + 1));
};

export const equals = (a: any, b: any): boolean => {
  if (a === b) {
    return true;
  }
  // eslint-disable-next-line no-self-compare
  if (a !== a && b !== b) {
    return true;
  }
  if (a instanceof Date && b instanceof Date && a.getTime() === b.getTime()) {
    return true;
  }
  return false;
};

export const set = <T>(
  object: T,
  path: Array<string | number>,
  value: *,
): T => {
  if (!Array.isArray(path)) {
    throw new TypeError('invalid path. expected array');
  }

  if (!path.length) {
    return value;
  }

  const key = path[0];
  const intKey = isInt(key) ? key : null;

  if (intKey === null && typeof key !== 'string') {
    throw new TypeError('invalid path. expected string or int');
  }

  const nextValue =
    path.length > 1
      ? set(
          object !== undefined ? (object: any)[key] : undefined,
          path.slice(1),
          value,
        )
      : value;

  if (intKey !== null) {
    if (Array.isArray(object) || object === undefined) {
      if (object && equals(nextValue, object[intKey])) {
        // The correct value is already in place, abort update.
        return object;
      }

      const result = object ? object.slice(0) : [];
      while (result.length <= intKey) {
        result.push(undefined);
      }

      result.splice(intKey, 1, nextValue);
      return (result: any);
    }

    throw new TypeError(`invalid value. expected array at ${key}`);
  } else if (Array.isArray(object)) {
    throw new TypeError(`invalid path. expected int at ${key} (string)`);
  }

  if (
    object !== null &&
    object !== undefined &&
    equals(nextValue, (object: any)[key])
  ) {
    // The correct value is already in place, abort update.
    return object;
  }

  return {...object, [path[0]]: nextValue};
};

export const get = (value: any, path: Array<string | number>): mixed => {
  if (!Array.isArray(path)) {
    throw new TypeError('invalid path. expected array');
  }

  if (!path.length) {
    return value;
  }

  const key = path[0];
  const keyIsInt = isInt(key);
  const valueIsArray = Array.isArray(value);
  const valueIsUndefined = value === undefined;

  if (!keyIsInt && typeof key !== 'string') {
    throw new TypeError('invalid path. expected string or int');
  }

  if ((keyIsInt || valueIsUndefined) !== (valueIsArray || valueIsUndefined)) {
    throw new TypeError(
      keyIsInt
        ? `invalid value. expected array at ${key}`
        : `invalid path. expected int at ${key} (string)`,
    );
  }

  return get(valueIsUndefined ? undefined : value[key], path.slice(1));
};

export const parsePath = (
  path: Array<string | number> | string,
): Array<string | number> => {
  if (Array.isArray(path)) {
    return path;
  }

  if (typeof path === 'string') {
    return path.split('.').reduce((result, part) => {
      if (part === '' && result.length === 0) {
        return result;
      }

      const [key, ...rest] = part.split('[');

      return result.concat(
        key === '' ? [] : [key],
        rest.map((i) => {
          const match = /^([0-9]+)\]$/.exec(i);
          if (!match) {
            throw new TypeError(`invalid path. syntax error at ${part}`);
          }
          return parseInt(match[1], 10);
        }),
      );
    }, []);
  }

  throw new TypeError('invalid path. expected array or string');
};

export const formatPath = (path: Array<string | number> | string): string => {
  if (typeof path === 'string') {
    return path;
  }

  if (Array.isArray(path)) {
    let result = '';

    path.forEach((part) => {
      if (isInt(part)) {
        result += `[${part}]`;
      } else if (result) {
        result += `.${part}`;
      } else {
        result = part;
      }
    });

    return result;
  }

  throw new TypeError('invalid path. expected array or string');
};

export const matchesDeep = (value: any, test: (mixed) => boolean): boolean => {
  if (test(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      if (matchesDeep(value[i], test)) return true;
    }
  }

  if (/^\[object Object\]$/.test(Object.prototype.toString.call(value))) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (matchesDeep(value[key], test)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const createIsEvent = (EventClass: Function) => (
  _event: mixed,
): boolean => {
  if (_event instanceof EventClass) {
    return true;
  }

  // Duck-type SyntheticEvent instances
  if (_event !== null && _event !== undefined && typeof _event === 'object') {
    const constructor = _event.constructor;

    if (constructor !== null && constructor !== undefined) {
      const name = constructor.name;
      return /^Synthetic[A-Z]*[a-z]*Event$/.test(name);
    }
  }

  return false;
};

export const isEvent = createIsEvent(Event);

export const createCastEvent = (EventClass: Function) => {
  const isEvent = createIsEvent(EventClass);

  return <T>(event: mixed): Event | SyntheticEvent<T> | null => {
    return isEvent(event) ? (event: any) : null;
  };
};

export const castEvent = createCastEvent(Event);

export const createMergeHandlers = (EventClass: Function) => {
  const castEvent = createCastEvent(EventClass);

  return (h1: ((mixed) => mixed) | void, h2: (mixed) => void) => {
    return (eventOrValue: mixed): void => {
      if (h1) {
        h1(eventOrValue);

        const event = castEvent(eventOrValue);
        if (event !== null && event.defaultPrevented) {
          return;
        }
      }

      h2(eventOrValue);
    };
  };
};

export const mergeHandlers = createMergeHandlers(Event);

export const createParseEvent = (
  EventClass: Function,
  HTMLElementClass: Function,
) => {
  const castEvent = createCastEvent(EventClass);

  return (eventOrValue: mixed): mixed => {
    const event = castEvent(eventOrValue);

    if (!event) {
      return eventOrValue;
    }

    if (event.target instanceof HTMLElementClass) {
      const type = event.target.type;

      if (type === 'checkbox') {
        return !!event.target.checked;
      }

      // TODO: Parse additional event types: file, multiple-select, etc.

      return event.target.value;
    }

    return undefined;
  };
};

export const parseEvent = createParseEvent(Event, HTMLElement);

export const lazyUpdate = <T: Object, U: $Shape<T>>(
  state: T,
  update: U,
): U | null => {
  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      if (state[key] !== update[key]) {
        return update;
      }
    }
  }

  return null;
};
