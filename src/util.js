// @flow

// flowlint unclear-type:off

const isInt = (val: mixed): boolean %checks => {
  return typeof val === 'number' && val === (val | 0);
};

export const insert = <T>(
  array: Array<T>,
  index: number,
  value: T,
): Array<T> => {
  return array.slice(0, index).concat([value], array.slice(index));
};

export const remove = <T>(array: Array<T>, index: number): Array<T> => {
  return array.slice(0, index).concat(array.slice(index + 1));
};

export const set = <T>(
  object: T,
  path: Array<string | number>,
  value: *,
): T => {
  if (!path.length) {
    return object;
  }

  const key = path[0];

  const nextValue =
    path.length > 1
      ? set(
          object !== undefined ? (object: any)[key] : undefined,
          path.slice(1),
          value,
        )
      : value;

  const intKey = isInt(key) ? key : null;

  if (intKey !== null && (Array.isArray(object) || object === undefined)) {
    const result = object ? object.slice(0) : [];
    while (result.length <= intKey) {
      result.push(undefined);
    }

    result.splice(intKey, 1, nextValue);
    return (result: any);
  }

  if (intKey !== null) {
    throw new Error(`Invalid path at ${key}. Expected array.`);
  }

  return {...object, [path[0]]: nextValue};
};

export const get = (value: any, path: Array<string | number>): mixed => {
  return path.length ? get(value[path[0]], path.slice(1)) : value;
};

export const parsePath = (
  path: Array<string | number> | string,
): Array<string | number> => {
  if (Array.isArray(path)) return path;

  if (typeof path === 'string') {
    return path.split('.').reduce((result, part) => {
      const [key, ...rest] = part.split('[');
      return result.concat(
        key,
        rest.map((i) => {
          const match = /^([0-9]+)\]$/.exec(i);
          if (!match) throw new Error(`Invalid path syntax at ${part}`);
          return parseInt(match[1], 10);
        }),
      );
    }, []);
  }

  throw new TypeError('Expected array or string.');
};

export const formatPath = (path: Array<string | number> | string): string => {
  if (typeof path === 'string') return path;

  if (Array.isArray(path)) {
    let result = '';

    path.forEach((part) => {
      if (isInt(part)) {
        result += `[${part}]`;
      }

      if (result) {
        result += `.${part}`;
      }

      result = part;
    });

    return result;
  }

  throw new TypeError('Expected array or string.');
};

export const matchesDeep = (value: any, test: (mixed) => boolean): boolean => {
  if (test(value)) return true;

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

export const compareDeep = (
  a: any,
  b: any,
  test: (a: mixed, b: mixed) => boolean,
): boolean => {
  // Check if and b are the same literal value or the same object pointer.
  if (equals(a, b)) return true;

  // Assert that a and b are both truthy or both falsy.
  if ((!a && b) || (!b && a)) return false;

  const aType = Object.prototype.toString.call(a);
  const bType = Object.prototype.toString.call(b);

  // Assert that a and b are of the same type.
  if (aType !== bType) return false;

  if (/^\[object Array\]$/.test(aType)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!test(a[i], b[i])) return false;
    }

    // Both arrays are the same;
    return true;
  }

  if (/^\[object Object\]$/.test(aType)) {
    const checkedKeys = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const key in a) {
      if (Object.prototype.hasOwnProperty.call(a, key)) {
        checkedKeys.push(key);
        if (!test(a[key], b[key])) return false;
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key in a) {
      if (
        Object.prototype.hasOwnProperty.call(b, key) &&
        checkedKeys.indexOf(key) === -1
      ) {
        if (!test(a[key], b[key])) return false;
      }
    }

    // Both objects contain the same field-value pairs (excluding undefined),
    // but not necessarily in the same order.
    return true;
  }

  return false;
};

export const equalsDeep = (a: mixed, b: mixed) => compareDeep(a, b, equalsDeep);

export const getId = () => {
  const current = (getId: any)._current || 0;
  (getId: any)._current = current + 1;
  return current;
};

export const isEvent = (_event: mixed): boolean => {
  if (_event instanceof Event) {
    return true;
  }

  // Duck-type SyntheticEvent instances
  if (_event !== null && _event !== undefined && typeof _event === 'object') {
    const constructor = _event.constructor;

    if (constructor !== null && constructor !== undefined) {
      const name = constructor.name;
      return /^Syntetic([A-Z][a-z]+)?Event$/.test(name);
    }
  }

  return false;
};

export const castEvent = <T>(
  event: mixed,
): Event | SyntheticEvent<T> | null => {
  return isEvent(event) ? (event: any) : null;
};

export const mergeHandlers = (
  a: ((mixed) => mixed) | void,
  b: (mixed) => void,
) => {
  return (eventOrValue: mixed): void => {
    if (a) {
      const event = castEvent(eventOrValue);
      if (event !== null && event.defaultPrevented) {
        return;
      }
    }
    b(eventOrValue);
  };
};

export const parseEvent = (eventOrValue: mixed): mixed => {
  const event = castEvent(eventOrValue);

  if (!event) {
    return eventOrValue;
  }

  if (event.target instanceof HTMLInputElement) {
    const type = event.target.type;

    // TODO: File and select multiple events

    if (type === 'checkbox') {
      return !!event.target.checked;
    }

    return event.target.value;
  }

  return undefined;
};
