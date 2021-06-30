---
id: "formstate"
title: "Class: FormState<VS, SD, ES, WS>"
sidebar_label: "FormState"
sidebar_position: 0
custom_edit_url: null
---

A class that implements the core form state machine behavior.

## Type parameters

| Name | Description |
| :------ | :------ |
| `VS` | Type of form value state. |
| `SD` | Type of submit handler result. |
| `ES` | Type of form error state. |
| `WS` | Type of form warning state. |

## Hierarchy

- `StateManager`<[`FormData`](../interfaces/formdata.md)<`VS`, `SD`, `ES`, `WS`\>\>

  ↳ **`FormState`**

## Constructors

### constructor

• **new FormState**<`VS`, `SD`, `ES`, `WS`\>(`initialValues`, `options`)

Create a new [FormState](formstate.md) instance with initial values and
[config options](../interfaces/formoptions.md).

```js
const form = new FormState(
   // Initial form values
   {
     name: '',
     email: '',
   },

   // Form options
   {
     // Submit handler
     async onSubmit(values) {
       return {ok: true};
     },

     // Error validation callback
     validate(values) {
       const errors = {};

       if (!values.name) {
         errors.name = 'required;
       }

       if (!values.email) {
         errors.email = 'required;
       }

       return errors;
     },

     // Warning validation callback
     warn(values) {
       const warnings = {};

       if (!/.+\@.+\..+/.test(values.email)) {
         warnings.email = 'invalid email';
       }

       return warnings;
     },
   },
);
```

#### Type parameters

| Name |
| :------ |
| `VS` |
| `SD` |
| `ES` |
| `WS` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValues` | `VS` | Initial form values. |
| `options` | [`FormOptions`](../interfaces/formoptions.md)<`VS`, `SD`, `ES`, `WS`\> | Form options object. |

#### Overrides

StateManager&lt;
  FormData&lt;VS, SD, ES, WS\&gt;
\&gt;.constructor

## Methods

### acceptPendingFieldValue

▸ **acceptPendingFieldValue**(`path`): `void`

Set the pending value as the current value for a field.

 (See also: [rejectPendingFieldValue](formstate.md#rejectpendingfieldvalue))

```js {7}
const form = new FormState({foo: 'bar'}, {onSubmit() {...}});

formState.setValues({foo, 'updated'});

formState.getFieldValue('foo'); // 'bar'

formState.acceptPendingFieldValue('foo');

formState.getFieldValue('foo'); // 'updated'
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) | The path to a field within the form state. |

#### Returns

`void`

___

### blurField

▸ **blurField**(`path`): `void`

Process a blur event for a given path. This clears the current focused path
state and sets the touched flag for that path. In the case that the current
focused path is not the provided path, this action applies the effects of
an implicit focus event before applying the blur effects. This serves as
backup in case a field has failed to fire a focus event, keeping the derived
state consistent.

(See also: [focusField](formstate.md#focusfield))

```js {3}
const form = new FormState({foo: 'bar'}, ...);

formState.blurField('foo');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) | The path to a field within the form state. |

#### Returns

`void`

___

### focusField

▸ **focusField**(`path`): `void`

Process a focus event for a given path. This sets the current focus path to
the provided path and sets the visited flag for that path. In the case that
the current focused path is not undefined, this action applies the effects
of an implicit blur event before applying the focus effects. This serves as
backup in case a field has failed to fire a blur event, keeping the derived
state consistent.

(See also: [blurField](formstate.md#blurfield))

```js {3}
const form = new FormState({foo: 'bar'}, ...);

formState.focusField('foo');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) | The path to a field within the form state. |

#### Returns

`void`

___

### getError

▸ **getError**(): `undefined` \| [`SubmitError`](submiterror.md)

Get the current submit error.

```js {9}
const form = new FormState({}, {
  async onSubmit(values) {
    return {ok: false,  error: new SubmitValidationError({...})};
  }
};

await form.submit();

form.getError(); // SubmitValidationError
```

#### Returns

`undefined` \| [`SubmitError`](submiterror.md)

___

### getErrors

▸ **getErrors**(): `undefined` \| `ES`

Get the current error validation state. This method returns the most recent
value returned from [FormOptions.validate](../interfaces/formoptions.md#validate).

See [validation](../../validation.md).

```js {9}
const form = new FormState({}, {
  onSubmit(values) {
    return {ok: false,  error: new SubmitValidationError({...})};
  }
};

await form.submit();

form.getError(); // SubmitValidationError
```

#### Returns

`undefined` \| `ES`

___

### getFieldError

▸ **getFieldError**(`path`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`any`

___

### getFieldValue

▸ **getFieldValue**(`path`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`any`

___

### getFieldWarning

▸ **getFieldWarning**(`path`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`any`

___

### getInitialFieldValue

▸ **getInitialFieldValue**(`path`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`any`

___

### getPendingFieldValue

▸ **getPendingFieldValue**(`path`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`any`

___

### getResult

▸ **getResult**(): `undefined` \| `SD`

#### Returns

`undefined` \| `SD`

___

### getState

▸ **getState**(): [`FormData`](../interfaces/formdata.md)<`VS`, `SD`, `ES`, `WS`\>

#### Returns

[`FormData`](../interfaces/formdata.md)<`VS`, `SD`, `ES`, `WS`\>

#### Inherited from

StateManager.getState

___

### getSubmitErrors

▸ **getSubmitErrors**(): `undefined` \| `ES`

Get the current warning validation state. This method returns the most
recent value returned from [FormOptions.validate](../interfaces/formoptions.md#validate).

#### Returns

`undefined` \| `ES`

___

### getSubmitStatus

▸ **getSubmitStatus**(): [`FormSubmitStatus`](../enums/formsubmitstatus.md)

#### Returns

[`FormSubmitStatus`](../enums/formsubmitstatus.md)

___

### getWarnings

▸ **getWarnings**(): `undefined` \| `WS`

Get the current warning validation state. This method returns the most
recent value returned from [FormOptions.warn](../interfaces/formoptions.md#warn).

#### Returns

`undefined` \| `WS`

___

### isFieldFocused

▸ **isFieldFocused**(`path`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`boolean`

___

### isFieldTouched

▸ **isFieldTouched**(`path`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`boolean`

___

### isFieldVisited

▸ **isFieldVisited**(`path`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |

#### Returns

`boolean`

___

### rejectPendingFieldValue

▸ **rejectPendingFieldValue**(`path`): `void`

Set the current value as the pending value for a field.

(See also: [acceptPendingFieldValue](formstate.md#acceptpendingfieldvalue))

```js {7}
const form = new FormState({foo: 'bar'}, {onSubmit() {}});

formState.setValues({foo, 'updated'});

formState.getPendingFieldValue('foo'); // 'updated'

formState.rejectPendingFieldValue('foo');

formState.getPendingFieldValue('foo'); // 'foo'
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) | The path to a field within the form state. |

#### Returns

`void`

___

### runValidate

▸ **runValidate**(): `void`

Update the error state with the result of the provided validate callback.

#### Returns

`void`

___

### runWarn

▸ **runWarn**(): `void`

Update the warning state with the result of the provided warn callback.

#### Returns

`void`

___

### setFieldValue

▸ **setFieldValue**(`path`, `setValueAction`): `void`

Set the current value at a given path and run the provided validate and
warn callbacks to update the error and warning state if the value change
is not idempotent.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) | The path to a field within the form state. |
| `setValueAction` | `any` |  |

#### Returns

`void`

___

### setValues

▸ **setValues**(`values`): `void`

Process an incoming values prop. This action update the cached initial
values and pending values in the state - which will in turn update the
derived detached and dirty flags returned from useField.

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `VS` |

#### Returns

`void`

___

### submit

▸ **submit**(): `Promise`<`void`\>

Submit the current form values by calling the configured submit callback.

#### Returns

`Promise`<`void`\>

A promise that resolves when the submit sequence is complete.

___

### subscribe

▸ **subscribe**(`subscriber`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscriber` | () => `void` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `unsubscribe` | () => `void` |

#### Inherited from

StateManager.subscribe
