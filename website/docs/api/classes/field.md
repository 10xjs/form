---
id: "field"
title: "Class: Field<T>"
sidebar_label: "Field"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Field value type. |

## Hierarchy

- `StateManager`<[`FieldData`](../interfaces/fielddata.md)<`T`\>\>

  ↳ **`Field`**

## Constructors

### constructor

• **new Field**<`T`\>(`path`, `form`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | [`FieldPath`](../types/fieldpath.md) |
| `form` | [`FormState`](formstate.md)<`any`, `any`, `any`, `any`\> |

#### Overrides

StateManager&lt;FieldData&lt;T\&gt;\&gt;.constructor

## Properties

### form

• `Readonly` **form**: [`FormState`](formstate.md)<`any`, `any`, `any`, `any`\>

___

### path

• `Readonly` **path**: [`FieldPath`](../types/fieldpath.md)

## Methods

### acceptPendingValue

▸ **acceptPendingValue**(): `void`

#### Returns

`void`

___

### blur

▸ **blur**(): `void`

#### Returns

`void`

___

### focus

▸ **focus**(): `void`

#### Returns

`void`

___

### getError

▸ **getError**(): `unknown`

The current field error value.

#### Returns

`unknown`

___

### getInitialValue

▸ **getInitialValue**(): `T`

The initial value set set by an update to the root form value state.

#### Returns

`T`

___

### getPendingValue

▸ **getPendingValue**(): `T`

The pending value set set by an update to the root form value state.

#### Returns

`T`

___

### getState

▸ **getState**(): [`FieldData`](../interfaces/fielddata.md)<`T`\>

#### Returns

[`FieldData`](../interfaces/fielddata.md)<`T`\>

#### Inherited from

StateManager.getState

___

### getValue

▸ **getValue**(): `T`

The current value of the field.

#### Returns

`T`

___

### getWarning

▸ **getWarning**(): `unknown`

The current field warning value.

#### Returns

`unknown`

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

### rejectPendingValue

▸ **rejectPendingValue**(): `void`

#### Returns

`void`

___

### setValue

▸ **setValue**(`setValueAction`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `setValueAction` | [`SetValueAction`](../types/setvalueaction.md)<`T`\> |

#### Returns

`void`

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
