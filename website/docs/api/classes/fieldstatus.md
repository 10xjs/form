---
id: "fieldstatus"
title: "Class: FieldStatus"
sidebar_label: "FieldStatus"
---

## Hierarchy

* [StateManager](statemanager.md)&#60;[FieldStatusData](../interfaces/fieldstatusdata.md)>

  ↳ **FieldStatus**

## Implements

* [Subscribable](../interfaces/subscribable.md)&#60;[FieldStatusData](../interfaces/fieldstatusdata.md)>

## Constructors

### constructor

\+ **new FieldStatus**(`field`: [Field](field.md)&#60;any>): [FieldStatus](fieldstatus.md)

*Overrides [StateManager](statemanager.md).[constructor](statemanager.md#constructor)*

#### Parameters:

Name | Type |
------ | ------ |
`field` | [Field](field.md)&#60;any> |

**Returns:** [FieldStatus](fieldstatus.md)

## Properties

### field

• `Readonly` **field**: [Field](field.md)&#60;any>

## Methods

### getState

▸ **getState**(): T

*Inherited from [StateManager](statemanager.md).[getState](statemanager.md#getstate)*

**Returns:** T

___

### hasError

▸ **hasError**(): boolean

The current field error value.

**Returns:** boolean

___

### hasWarning

▸ **hasWarning**(): boolean

The current field warning value.

**Returns:** boolean

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
