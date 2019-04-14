import {PathArray, Path} from './types';

const formatErrorPath = (path: unknown[], more: boolean): string => {
  return path
    .map((val): string => (typeof val === 'string' ? `"${val}"` : `${val}`))
    .concat(more ? ['...'] : [])
    .join(', ');
};

export const pathError = (): string =>
  'Invalid path. Expected array or string.';
export const pathSyntaxError = (path: string): string =>
  `Invalid path. Syntax error at "${path}".`;
export const emptyPathError = (): string =>
  'Invalid path. Expected non-empty array or string.';
export const emptyPathArrayError = (): string =>
  'Invalid path. Expected non-empty array.';
export const emptyPathStringError = (): string =>
  'Invalid path. Expected non-empty string.';
export const arrayTargetError = (): string => 'Invalid target. Expected array.';
export const indexError = (): string => 'Invalid index. Expected int.';
export const boundsError = (): string => 'Invalid index. Out of bounds.';
export const pathArrayError = (): string => 'Invalid path. Expected array.';
export const expectedArrayError = (
  value: unknown,
  path: unknown[],
  more: boolean,
): string =>
  `Invalid value. Expected array at path: [ ${formatErrorPath(
    path,
    more,
  )} ]. Encountered value: ${value}.`;
export const expectedPathIntError = (path: unknown[], more: boolean): string =>
  `Invalid path part. Expected int at path: [ ${formatErrorPath(
    path,
    more,
  )} ].`;
export const pathPartError = (path: unknown[], more: boolean): string =>
  `Invalid path part. Expected string or int at path: [ ${formatErrorPath(
    path,
    more,
  )} ].`;

export const isValidPath = (path: unknown): path is string => {
  return (
    (Array.isArray(path) && path.length !== 0) ||
    (typeof path === 'string' && path !== '')
  );
};

export const isInt = (val: unknown): val is number => {
  return typeof val === 'number' && val === (val | 0);
};

export const insert = <T extends any>(
  array: T[],
  index: number,
  value: T,
): T[] => {
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

export const remove = <T extends unknown>(array: T[], index: number): T[] => {
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

export const equals = (a: unknown, b: unknown): boolean => {
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

export const formatPath = (path: Path): string => {
  if (typeof path === 'string') {
    return path;
  }

  if (Array.isArray(path)) {
    let result = '';

    path.forEach(
      (part): void => {
        if (isInt(part)) {
          result += `[${part}]`;
        } else if (result) {
          result += `.${part}`;
        } else {
          result = part;
        }
      },
    );

    return result;
  }

  throw new TypeError(pathError());
};

export const parsePath = (path: Path): PathArray => {
  if (Array.isArray(path)) {
    return path;
  }

  if (typeof path === 'string') {
    return path.split('.').reduce(
      (result, part): PathArray => {
        if (part === '' && result.length === 0) {
          return result;
        }

        const split = part.split('[');
        const key = split[0];
        const rest = split.slice(1);

        return result.concat(
          key === '' ? [] : [key],
          rest.map(
            (i): number => {
              const match = /^([0-9]+)\]$/.exec(i);
              if (!match) {
                throw new TypeError(
                  pathSyntaxError(formatPath(result.concat([part]))),
                );
              }
              return parseInt(match[1], 10);
            },
          ),
        );
      },
      [] as PathArray,
    );
  }

  throw new TypeError(pathError());
};

const _setWith = <T extends any>(
  value: T,
  path: PathArray,
  updater: (value: any) => any,
  currentPath: PathArray = [],
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

  const nextValue = value !== undefined ? value[key] : undefined;
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
      return result as T;
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
    equals(updateResult, value[key])
  ) {
    // The correct value is already in place, abort update.
    return value;
  }

  const result = Object.assign({}, value);
  result[path[0]] = updateResult;
  return result;
};

export const setWith = <T extends any>(
  object: T,
  path: PathArray,
  updater: (value: any) => any,
): T => _setWith(object, path, updater);

export const set = <T extends any>(object: T, path: PathArray, value: any): T =>
  _setWith(object, path, (): any => value);

export const get = (
  value: any,
  path: PathArray,
  currentPath: PathArray = [],
): unknown => {
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

export const matchesDeep = (
  value: any,
  test: (value: unknown) => boolean,
): boolean => {
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

export const hasValue = (value: unknown): boolean =>
  matchesDeep(
    value,
    (value): boolean =>
      !/^\[object (Object|Array|Undefined)\]$/.test(
        Object.prototype.toString.call(value),
      ),
  );

export const isEvent = (
  event: any,
): event is Event | React.SyntheticEvent<HTMLElement> => {
  // Duck-type Event and SyntheticEvent instances
  return (
    event !== null &&
    typeof event === 'object' &&
    typeof event.stopPropagation === 'function' &&
    typeof event.preventDefault === 'function' &&
    event.target &&
    event.target.constructor &&
    /^HTML.*?Element$/.test(event.target.constructor.name)
  );
};

export const mergeHandlers = (
  h1: ((eventOrValue: unknown) => unknown) | void,
  h2: (eventOrValue: unknown) => void,
): ((eventOrValue: unknown) => void) => {
  return (eventOrValue: unknown): void => {
    if (h1) {
      h1(eventOrValue);

      if (isEvent(eventOrValue) && eventOrValue.defaultPrevented) {
        return;
      }
    }

    h2(eventOrValue);
  };
};

export const parseEvent = (eventOrValue: unknown): unknown => {
  if (isEvent(eventOrValue) && eventOrValue.target) {
    const type = (eventOrValue.target as HTMLInputElement).type;

    if (type === 'checkbox') {
      return !!(eventOrValue.target as HTMLInputElement).checked;
    }

    // TODO: Parse additional event types: file, multiple-select, etc.

    return (eventOrValue.target as HTMLInputElement).value;
  }

  return eventOrValue;
};
