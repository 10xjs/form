---
id: "field"
title: "Class: Field<T>"
sidebar_label: "Field"
---

## Type parameters

Name | Description |
------ | ------ |
`T` | Field value type.  |

## Hierarchy

* [StateManager](statemanager.md)&#60;[FieldData](../interfaces/fielddata.md)&#60;T>>

  ↳ **Field**

## Implements

* [Subscribable](../interfaces/subscribable.md)&#60;[FieldData](../interfaces/fielddata.md)&#60;T>>

## Constructors

### constructor

\+ **new Field**(`path`: [FieldPath](../types/fieldpath.md), `form`: [FormState](formstate.md)&#60;any, any, any, any>): [Field](field.md)

*Overrides [StateManager](statemanager.md).[constructor](statemanager.md#constructor)*

#### Parameters:

Name | Type |
------ | ------ |
`path` | [FieldPath](../types/fieldpath.md) |
`form` | [FormState](formstate.md)&#60;any, any, any, any> |

**Returns:** [Field](field.md)

## Properties

### form

• `Readonly` **form**: [FormState](formstate.md)&#60;any, any, any, any>

___

### path

• `Readonly` **path**: [FieldPath](../types/fieldpath.md)

## Methods

### acceptPendingValue

▸ **acceptPendingValue**(): void

**Returns:** void

___

### blur

▸ **blur**(): void

**Returns:** void

___

### focus

▸ **focus**(): void

**Returns:** void

___

### getError

▸ **getError**(): unknown

The current field error value.

**Returns:** unknown

___

### getInitialValue

▸ **getInitialValue**(): T

The initial value set set by an update to the root form value state.

**Returns:** T

___

### getPendingValue

▸ **getPendingValue**(): T

The pending value set set by an update to the root form value state.

**Returns:** T

___

### getState

▸ **getState**(): T

*Inherited from [StateManager](statemanager.md).[getState](statemanager.md#getstate)*

**Returns:** T

___

### getValue

▸ **getValue**(): T

The current value of the field.

**Returns:** T

___

### getWarning

▸ **getWarning**(): unknown

The current field warning value.

**Returns:** unknown

___

### isDetached

▸ **isDetached**(): boolean

True if the current value is different from the pending value.

**Returns:** boolean

___

### isDirty

▸ **isDirty**(): boolean

True if the current value is different from the initial value.

**Returns:** boolean

___

### isFocused

▸ **isFocused**(): boolean

True if the field is currently focused.

**Returns:** boolean

___

### isTouched

▸ **isTouched**(): boolean

True if the field value has been edited.

**Returns:** boolean

___

### isVisited

▸ **isVisited**(): boolean

True if the field is has been or is currently focused.

**Returns:** boolean

___

### rejectPendingValue

▸ **rejectPendingValue**(): void

**Returns:** void

___

### setValue

▸ **setValue**(`setValueAction`: [SetValueAction](../types/setvalueaction.md)&#60;T>): void

#### Parameters:

Name | Type |
------ | ------ |
`setValueAction` | [SetValueAction](../types/setvalueaction.md)&#60;T> |

**Returns:** void

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
