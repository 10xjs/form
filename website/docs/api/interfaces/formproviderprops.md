---
id: "formproviderprops"
title: "Interface: FormProviderProps<VS, SD, ES, WS>"
sidebar_label: "FormProviderProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `VS` | `VS` | Type of form value state. |
| `SD` | `SD` | Type of submit handler result. |
| `ES` | `undefined` | Type of form error state. |
| `WS` | `undefined` | Type of form warning state. |

## Hierarchy

- [`FormOptions`](formoptions.md)<`VS`, `SD`, `ES`, `WS`\>

  ↳ **`FormProviderProps`**

## Properties

### children

• `Optional` **children**: `ReactNode` \| (`form`: [`FormState`](../classes/formstate.md)<`VS`, `SD`, `ES`, `WS`\>) => ``null`` \| `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

___

### onSubmit

• **onSubmit**: [`SubmitHandler`](../types/submithandler.md)<`VS`, `SD`\>

This handler is triggered by a call to the [FormState.submit](../classes/formstate.md#submit) method
if all fields are currently valid and returns a
[submit result](../types/submitresult.md) representing either a successful
submit or a [submit error](../classes/submiterror.md).

```js {2-5}
const options = {
  async onSubmit(values) {
    // process submit event...
    return {ok: true, data: ...};
  },
};
```

Return async submit validation errors as a failed submit result, _not_ as
a thrown error or rejected promise (See [error handling](../../errors.md)).

```js live noInline
const options = {
  async onSubmit(values) {
    // process submit event...
    return {ok: false, data: new SubmitValidationError({...})};
  },
};
```

#### Inherited from

[FormOptions](formoptions.md).[onSubmit](formoptions.md#onsubmit)

___

### validate

• `Optional` **validate**: [`ValidateHandler`](../types/validatehandler.md)<`VS`, `ES`\>

Run error validation on the entire value state. This handler is triggered
when a [FormState](../classes/formstate.md) instance is first initialized and every time the
value state changes. The return value is an object that matches the
structure of the form value state where any non-empty value at the same
path as a field is considered an error
(See [Validation](../../validation.md)).

```js {3-6}
const options = {
  ...
  validate(values) {
    const errors {};
    // process validation...
    return errors;
  },
};
```

#### Inherited from

[FormOptions](formoptions.md).[validate](formoptions.md#validate)

___

### values

• **values**: `VS`

___

### warn

• `Optional` **warn**: [`ValidateHandler`](../types/validatehandler.md)<`VS`, `WS`\>

Use this handler to process _soft_ validation "errors" that should not
block a submit event. This handler otherwise has identical behavior to
[FormOptions.validate](formoptions.md#validate).

```js {3-6}
const options = {
  ...
  warn(values) {
    const warnings {};
    // process validation...
    return warnings;
  },
};
```

#### Inherited from

[FormOptions](formoptions.md).[warn](formoptions.md#warn)
