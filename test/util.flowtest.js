// @flow strict

import {isValidPath, isInt} from '../src/util';

declare var maybeNumber: mixed;

// $ExpectError cast mixed to number
(maybeNumber: number);

if (isInt(maybeNumber)) {
  (maybeNumber: number);
}

declare var maybeValidPath: mixed;

// $ExpectError cast mixed to array or string
(maybeValidPath: Array<mixed> | string);

if (isValidPath(maybeValidPath)) {
  (maybeValidPath: Array<mixed> | string);
}
