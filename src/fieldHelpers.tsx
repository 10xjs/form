import * as React from 'react';

import {FieldInterface} from './useField';

type RequiredInputInterface<FV> = Pick<
  FieldInterface<FV, any, any>,
  'setValue' | 'focus' | 'blur' | 'value'
>;

type Parse<EV, FV> = (eventValue: EV, previousValue: FV) => FV;
type Format<FV, IV> = (value: FV) => IV;

export interface HelperConfig<EV, IV, FV> {
  parse?: Parse<EV, FV>;
  format?: Format<FV, IV>;
}

export interface Handlers<EV, FV> {
  onChange: (eventValue: EV) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const handlers = <EV, FV>(
  field: RequiredInputInterface<FV>,
  parse: Parse<EV, FV>,
): Handlers<EV, FV> => ({
  onFocus: field.focus,
  onBlur: field.blur,
  onChange: (eventValue: EV) => {
    field.setValue(parse(eventValue, field.value));
  },
});

interface Input<EV, IV, FV> extends Handlers<EV, FV> {
  value: IV;
}

const defaultInputConfig = {
  format: (value: any): string =>
    value === undefined || value === null ? '' : `${value}`,
  parse: (event: React.ChangeEvent<{value: string}>): string =>
    event.target.value,
};

export const input = <
  EV extends any = React.ChangeEvent<{value: string}>,
  IV = string,
  FV = string
>(
  field: RequiredInputInterface<FV>,
  {
    format = defaultInputConfig.format as any,
    parse = defaultInputConfig.parse as any,
  }: HelperConfig<EV, IV, FV> = {},
): Input<EV, IV, FV> => {
  const result = handlers(field, parse);
  (result as Input<EV, IV, FV>).value = format(field.value);
  return result as Input<EV, IV, FV>;
};

export interface Checkbox<EV, FV> extends Handlers<EV, FV> {
  checked: boolean;
}

const defaultCheckboxConfig = {
  format: (value: any): boolean => !!value,
  parse: (event: React.ChangeEvent<{checked: boolean}>): boolean =>
    event.target.checked,
};

export const checkbox = <
  EV extends any = React.ChangeEvent<{value: boolean}>,
  FV = boolean
>(
  field: RequiredInputInterface<FV>,
  {
    format = defaultCheckboxConfig.format as any,
    parse = defaultCheckboxConfig.parse as any,
  }: HelperConfig<EV, boolean, FV> = {},
): Checkbox<EV, FV> => {
  const result = handlers(field, parse);
  (result as Checkbox<EV, FV>).checked = format(field.value);
  return result as Checkbox<EV, FV>;
};
