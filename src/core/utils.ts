/** @internal */
const formatErrorPath = (path: any[], more: boolean): string => {
  return path
    .map((val): string =>
      typeof val === 'string' ? `"${val}"` : `${String(val)}`,
    )
    .concat(more ? ['...'] : [])
    .join(', ');
};

/** @internal */
export const pathError = (): string =>
  'Invalid path. Expected array or string.';
/** @internal */
export const pathSyntaxError = (path: string): string =>
  `Invalid path. Syntax error at "${path}".`;
/** @internal */
export const arrayTargetError = (): string => 'Invalid target. Expected array.';
/** @internal */
export const indexError = (): string => 'Invalid index. Expected int.';
/** @internal */
export const boundsError = (): string => 'Invalid index. Out of bounds.';
/** @internal */
export const pathArrayError = (): string => 'Invalid path. Expected array.';
/** @internal */
export const expectedArrayError = (
  value: any,
  path: any[],
  more: any,
): string =>
  `Invalid value. Expected array at path: [ ${formatErrorPath(
    path,
    more,
  )} ]. Encountered value: ${String(value)}.`;
/** @internal */
export const expectedPathIntError = (path: any[], more: boolean): string =>
  `Invalid path part. Expected int at path: [ ${formatErrorPath(
    path,
    more,
  )} ].`;
/** @internal */
export const pathPartError = (path: any[], more: boolean): string =>
  `Invalid path part. Expected string or int at path: [ ${formatErrorPath(
    path,
    more,
  )} ].`;

/** @internal */
export const isValidPath = (path: any): path is string => {
  return (
    (Array.isArray(path) && path.length !== 0) ||
    (typeof path === 'string' && path !== '')
  );
};

/** @internal */
const isInt = (val: unknown): val is number => {
  return typeof val === 'number' && val === (val | 0);
};

export const insert = <T>(array: T[], index: number, value: T): T[] => {
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

/** @internal */
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

/** @internal */
export const formatPath = (path: string | Array<string | number>): string => {
  if (typeof path === 'string') {
    return path;
  }

  if (Array.isArray(path)) {
    let result = '';

    path.forEach((part): void => {
      if (isInt(part)) {
        result += `[${part}]`;
      } else if (result !== '') {
        result += `.${part}`;
      } else {
        result = part;
      }
    });

    return result;
  }

  throw new TypeError(pathError());
};

/** @internal */
export const parsePath = (
  path: string | Array<string | number>,
): Array<string | number> => {
  if (Array.isArray(path)) {
    return path;
  }

  if (typeof path === 'string') {
    return path.split('.').reduce<Array<string | number>>((result, part): Array<
      string | number
    > => {
      if (part === '' && result.length === 0) {
        return result;
      }

      const split = part.split('[');
      const key = split[0];
      const rest = split.slice(1);

      return result.concat(
        key === '' ? [] : [key],
        rest.map((i): number => {
          const match = /^([0-9]+)\]$/.exec(i);
          if (match === null) {
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

/** @internal */
const _setWith = (
  value: any,
  path: Array<string | number>,
  updater: (value: any) => any,
  currentPath: Array<string | number> = [],
) => {
  if (!Array.isArray(path)) {
    throw new Error(pathArrayError());
  }

  if (path.length === 0) {
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
      : _setWith(nextValue, path.slice(1), updater, currentPath.concat([key]));

  if (intKey !== null) {
    if (Array.isArray(value) || value === undefined) {
      if (value !== undefined && equals(updateResult, value[intKey])) {
        // The correct value is already in place, abort update.
        return value;
      }

      const result = value !== undefined ? value.slice(0) : [];
      while (result.length <= intKey) {
        result.push(undefined);
      }

      result.splice(intKey, 1, updateResult);
      return result;
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

export const setWith = <T>(
  object: T,
  path: Array<string | number>,
  updater: (value: any) => any,
): T => _setWith(object, path, updater);

export const set = <T>(
  object: T,
  path: Array<string | number>,
  value: any,
): T => _setWith(object, path, (): any => value);

/** @internal */
const _get = (
  value: any,
  path: Array<string | number>,
  currentPath: Array<string | number>,
): unknown => {
  if (!Array.isArray(path)) {
    throw new TypeError(pathArrayError());
  }

  if (path.length === 0) {
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

  return _get(
    valueIsUndefined ? undefined : value[key],
    path.slice(1),
    currentPath.concat([key]),
  );
};

export const get = (value: any, path: Array<string | number>): unknown =>
  _get(value, path, []);

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

/** @internal */
export const hasValue = (value: unknown): boolean =>
  matchesDeep(
    value,
    (value): boolean =>
      !/^\[object (Object|Array|Undefined|Null)\]$/.test(
        Object.prototype.toString.call(value),
      ),
  );

/**
 * Converts any value that is not considered to "have errors" to null. An object
 * no matter how deep that does not contain "leaf values" (string, number, or
 * boolean), while truthy, is considered to be empty. This allows the provided
 * validate and warn callback to safely return a structured object or array even
 * when there are no actual error values contained within.
 *
 * @internal
 */
export function normalizeError<TError>(error: TError) {
  return hasValue(error)
    ? (error as Exclude<TError, null | undefined>)
    : undefined;
}

/** @internal */
export const isEmpty = (object: any): boolean => {
  for (const _key in object) {
    return false;
  }
  return true;
};
