// @flow strict

// flowlint unclear-type:off

const formatErrorPath = (path: Array<any>, more: boolean): string => {
  return path
    .map((val) => (typeof val === 'string' ? `"${val}"` : `${val}`))
    .concat(more ? ['...'] : [])
    .join(', ');
};

export const pathError = () => 'Invalid path. Expected array or string.';
export const pathSyntaxError = (path: string) =>
  `Invalid path. Syntax error at "${path}".`;
export const emptyPathError = () =>
  'Invalid path. Expected non-empty array or string.';
export const emptyPathArrayError = () =>
  'Invalid path. Expected non-empty array.';
export const emptyPathStringError = () =>
  'Invalid path. Expected non-empty string.';
export const arrayTargetError = () => 'Invalid target. Expected array.';
export const indexError = () => 'Invalid index. Expected int.';
export const boundsError = () => 'Invalid index. Out of bounds.';
export const pathArrayError = () => 'Invalid path. Expected array.';
export const expectedArrayError = (
  value: any,
  path: Array<any>,
  more: boolean,
) =>
  `Invalid value. Expected array at path: [ ${formatErrorPath(
    path,
    more,
  )} ]. Encountered value: ${value}.`;
export const expectedPathIntError = (path: Array<any>, more: boolean) =>
  `Invalid path part. Expected int at path: [ ${formatErrorPath(
    path,
    more,
  )} ].`;
export const pathPartError = (path: Array<any>, more: boolean) =>
  `Invalid path part. Expected string or int at path: [ ${formatErrorPath(
    path,
    more,
  )} ].`;

export const isValidPath = (path: mixed): boolean %checks => {
  return (
    (Array.isArray(path) && path.length !== 0) ||
    (typeof path === 'string' && path !== '')
  );
};

export const isInt = (val: mixed): boolean %checks => {
  return typeof val === 'number' && val === (val | 0);
};

export const insert = <T>(
  array: Array<T>,
  index: number,
  value: T,
): Array<T> => {
  if (!Array.isArray(array)) {
    throw new TypeError(arrayTargetError());
  }

  if (!isInt(index)) {
    throw new TypeError(indexError());
  }

  if (index < 0 || index > array.length) {
    throw new TypeError(boundsError());
  }

  return array.slice(0, index).concat([value], array.slice(index));
};

export const remove = <T>(array: Array<T>, index: number): Array<T> => {
  if (!Array.isArray(array)) {
    throw new TypeError(arrayTargetError());
  }

  if (!isInt(index)) {
    throw new TypeError(indexError());
  }

  if (index < 0 || index >= array.length) {
    throw new TypeError(boundsError());
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

  throw new TypeError(pathError());
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

      const split = part.split('[');
      const key = split[0];
      const rest = split.slice(1);

      return result.concat(
        key === '' ? [] : [key],
        rest.map((i) => {
          const match = /^([0-9]+)\]$/.exec(i);
          if (!match) {
            throw new TypeError(
              pathSyntaxError(formatPath(result.concat([part]))),
            );
          }
          return parseInt(match[1], 10);
        }),
      );
    }, []);
  }

  throw new TypeError(pathError());
};

const _setWith = <T>(
  value: T,
  path: Array<string | number>,
  updater: (any) => any,
  currentPath: Array<string | number> = [],
): T => {
  if (!Array.isArray(path)) {
    throw pathArrayError();
  }

  if (!path.length) {
    return updater(value);
  }

  const key = path[0];
  const intKey = isInt(key) ? key : null;

  if (intKey === null && typeof key !== 'string') {
    throw new TypeError(
      pathPartError(currentPath.concat([key]), path.length > 1),
    );
  }

  const nextValue = value !== undefined ? (value: any)[key] : undefined;
  const updateResult =
    path.length === 1
      ? updater(nextValue)
      : _setWith(nextValue, path.slice(1), updater, currentPath.concat[key]);

  if (intKey !== null) {
    if (Array.isArray(value) || value === undefined) {
      if (value && equals(updateResult, value[intKey])) {
        // The correct value is already in place, abort update.
        return value;
      }

      const result = value ? value.slice(0) : [];
      while (result.length <= intKey) {
        result.push(undefined);
      }

      result.splice(intKey, 1, updateResult);
      return (result: any);
    }

    throw new TypeError(
      expectedArrayError(value, currentPath.concat([key]), path.length > 1),
    );
  } else if (Array.isArray(value)) {
    throw new TypeError(
      expectedPathIntError(currentPath.concat([key]), path.length > 1),
    );
  }

  if (
    value !== null &&
    value !== undefined &&
    equals(updateResult, (value: any)[key])
  ) {
    // The correct value is already in place, abort update.
    return value;
  }

  const result = Object.assign({}, value);
  result[path[0]] = updateResult;
  return result;
};

export const setWith = <T>(
  object: T,
  path: Array<string | number>,
  updater: (mixed) => mixed,
): T => _setWith(object, path, updater);

export const set = <T>(
  object: T,
  path: Array<string | number>,
  value: mixed,
): T => _setWith(object, path, () => value);

export const get = (
  value: any,
  path: Array<string | number>,
  currentPath: Array<string | number> = [],
): mixed => {
  if (!Array.isArray(path)) {
    throw new TypeError(pathArrayError());
  }

  if (!path.length) {
    return value;
  }

  const key = path[0];
  const keyIsInt = isInt(key);
  const valueIsArray = Array.isArray(value);
  const valueIsUndefined = value === undefined;

  if (!keyIsInt && typeof key !== 'string') {
    throw new TypeError(
      pathPartError(currentPath.concat([key]), path.length > 1),
    );
  }

  if ((keyIsInt || valueIsUndefined) !== (valueIsArray || valueIsUndefined)) {
    throw new TypeError(
      keyIsInt
        ? expectedArrayError(value, currentPath.concat([key]), path.length > 1)
        : expectedPathIntError(currentPath.concat([key]), path.length > 1),
    );
  }

  return get(
    valueIsUndefined ? undefined : value[key],
    path.slice(1),
    currentPath.concat[key],
  );
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

export const hasValue = (value: mixed) =>
  matchesDeep(
    value,
    (value) =>
      !/^\[object (Object|Array|Undefined)\]$/.test(
        Object.prototype.toString.call(value),
      ),
  );

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
