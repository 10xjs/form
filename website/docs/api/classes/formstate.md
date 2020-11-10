---
id: "formstate"
title: "Class: FormState<VS, SD, ES, WS>"
sidebar_label: "FormState"
---

A class that implements the core form state machine behavior.

## Type parameters

Name | Description |
------ | ------ |
`VS` | Type of form value state. |
`SD` | Type of submit handler result. |
`ES` | Type of form error state. |
`WS` | Type of form warning state.  |

## Hierarchy

* [StateManager](statemanager.md)&#60;[FormData](../interfaces/formdata.md)&#60;VS, SD, ES, WS>>

  ↳ **FormState**

## Implements

* [Subscribable](../interfaces/subscribable.md)&#60;[FormData](../interfaces/formdata.md)&#60;VS, SD, ES, WS>>

## Constructors

### constructor

\+ **new FormState**(`initialValues`: VS, `options`: [FormOptions](../interfaces/formoptions.md)&#60;VS, SD, ES, WS>): [FormState](formstate.md)

*Overrides [StateManager](statemanager.md).[constructor](statemanager.md#constructor)*

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

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`initialValues` | VS | Initial form values. |
`options` | [FormOptions](../interfaces/formoptions.md)&#60;VS, SD, ES, WS> | Form options object.  |

**Returns:** [FormState](formstate.md)

## Methods

### acceptPendingFieldValue

▸ **acceptPendingFieldValue**(`path`: [FieldPath](../types/fieldpath.md)): void

Set the pending value as the current value for a field.

 (See also: [rejectPendingFieldValue](formstate.md#rejectpendingfieldvalue))

```js {7}
const form = new FormState({foo: 'bar'}, {onSubmit() {...}});

formState.setValues({foo, 'updated'});

formState.getFieldValue('foo'); // 'bar'

formState.acceptPendingFieldValue('foo');

formState.getFieldValue('foo'); // 'updated'
```

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) | The path to a field within the form state.  |

**Returns:** void

___

### blurField

▸ **blurField**(`path`: [FieldPath](../types/fieldpath.md)): void

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

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) | The path to a field within the form state.  |

**Returns:** void

___

### focusField

▸ **focusField**(`path`: [FieldPath](../types/fieldpath.md)): void

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

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) | The path to a field within the form state.  |

**Returns:** void

___

### getError

▸ **getError**(): undefined \| [SubmitError](submiterror.md)

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

**Returns:** undefined \| [SubmitError](submiterror.md)

___

### getErrors

▸ **getErrors**(): undefined \| ES

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

**Returns:** undefined \| ES

___

### getFieldError

▸ **getFieldError**(`path`: [FieldPath](../types/fieldpath.md)): any

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** any

___

### getFieldValue

▸ **getFieldValue**(`path`: [FieldPath](../types/fieldpath.md)): any

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** any

___

### getFieldWarning

▸ **getFieldWarning**(`path`: [FieldPath](../types/fieldpath.md)): any

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** any

___

### getInitialFieldValue

▸ **getInitialFieldValue**(`path`: [FieldPath](../types/fieldpath.md)): any

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** any

___

### getPendingFieldValue

▸ **getPendingFieldValue**(`path`: [FieldPath](../types/fieldpath.md)): any

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** any

___

### getResult

▸ **getResult**(): undefined \| SD

**Returns:** undefined \| SD

___

### getState

▸ **getState**(): T

*Inherited from [StateManager](statemanager.md).[getState](statemanager.md#getstate)*

**Returns:** T

___

### getSubmitErrors

▸ **getSubmitErrors**(): undefined \| ES

Get the current warning validation state. This method returns the most
recent value returned from [FormOptions.validate](../interfaces/formoptions.md#validate).

**Returns:** undefined \| ES

___

### getSubmitStatus

▸ **getSubmitStatus**(): [FormSubmitStatus](../enums/formsubmitstatus.md)

**Returns:** [FormSubmitStatus](../enums/formsubmitstatus.md)

___

### getWarnings

▸ **getWarnings**(): undefined \| WS

Get the current warning validation state. This method returns the most
recent value returned from [FormOptions.warn](../interfaces/formoptions.md#warn).

**Returns:** undefined \| WS

___

### isFieldFocused

▸ **isFieldFocused**(`path`: [FieldPath](../types/fieldpath.md)): boolean

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** boolean

___

### isFieldTouched

▸ **isFieldTouched**(`path`: [FieldPath](../types/fieldpath.md)): boolean

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** boolean

___

### isFieldVisited

▸ **isFieldVisited**(`path`: [FieldPath](../types/fieldpath.md)): boolean

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |

**Returns:** boolean

___

### rejectPendingFieldValue

▸ **rejectPendingFieldValue**(`path`: [FieldPath](../types/fieldpath.md)): void

Set the current value as the pending value for a field.

(See also: [acceptPendingFieldValue](formstate.md#acceptpendingfieldvalue))

```js {7}
const form = new FormState({foo: 'bar'}, {onSubmit() {}});

formState.setValues({foo, 'updated'});

formState.getPendingFieldValue('foo'); // 'updated'

formState.rejectPendingFieldValue('foo');

formState.getPendingFieldValue('foo'); // 'foo'
```

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) | The path to a field within the form state.  |

**Returns:** void

___

### runValidate

▸ **runValidate**(): void

Update the error state with the result of the provided validate callback.

**Returns:** void

___

### runWarn

▸ **runWarn**(): void

Update the warning state with the result of the provided warn callback.

**Returns:** void

___

### setFieldValue

▸ **setFieldValue**(`path`: [FieldPath](../types/fieldpath.md), `setValueAction`: [SetValueAction](../types/setvalueaction.md)&#60;any>): void

Set the current value at a given path and run the provided validate and
warn callbacks to update the error and warning state if the value change
is not idempotent.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) | The path to a field within the form state. |
`setValueAction` | [SetValueAction](../types/setvalueaction.md)&#60;any> |   |

**Returns:** void

___

### setValues

▸ **setValues**(`values`: VS): void

Process an incoming values prop. This action update the cached initial
values and pending values in the state - which will in turn update the
derived detached and dirty flags returned from useField.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`values` | VS |   |

**Returns:** void

___

### submit

▸ **submit**(): Promise&#60;void>

Submit the current form values by calling the configured submit callback.

**Returns:** Promise&#60;void>

A promise that resolves when the submit sequence is complete.

___

### subscribe

▸ **subscribe**(`subscriber`: () => void): object

*Inherited from [StateManager](statemanager.md).[subscribe](statemanager.md#subscribe)*

#### Parameters:

Name | Type |
------ | ------ |
`subscriber` | () => void |

**Returns:** object

Name | Type |
------ | ------ |
`unsubscribe` | () => void |
