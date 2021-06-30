---
id: "fieldstatus"
title: "Class: FieldStatus"
sidebar_label: "FieldStatus"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `StateManager`<[`FieldStatusData`](../interfaces/fieldstatusdata.md)\>

  ↳ **`FieldStatus`**

## Constructors

### constructor

• **new FieldStatus**(`field`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | [`Field`](field.md)<`any`\> |

#### Overrides

StateManager&lt;FieldStatusData\&gt;.constructor

## Properties

### field

• `Readonly` **field**: [`Field`](field.md)<`any`\>

## Methods

### getState

▸ **getState**(): [`FieldStatusData`](../interfaces/fieldstatusdata.md)

#### Returns

[`FieldStatusData`](../interfaces/fieldstatusdata.md)

#### Inherited from

StateManager.getState

___

### hasError

▸ **hasError**(): `boolean`

The current field error value.

#### Returns

`boolean`

___

### hasWarning

▸ **hasWarning**(): `boolean`

The current field warning value.

#### Returns

`boolean`

___

### isDetached

▸ **isDetached**(): `boolean`

True if the current value is different from the pending value.

#### Returns

`boolean`

___

### isDirty

▸ **isDirty**(): `boolean`

True if the current value is different from the initial value.

#### Returns

`boolean`

___

### isFocused

▸ **isFocused**(): `boolean`

True if the field is currently focused.

#### Returns

`boolean`

___

### isTouched

▸ **isTouched**(): `boolean`

True if the field value has been edited.

#### Returns

`boolean`

___

### isVisited

▸ **isVisited**(): `boolean`

True if the field is has been or is currently focused.

#### Returns

`boolean`

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
