---
id: "formstatus"
title: "Class: FormStatus<SR>"
sidebar_label: "FormStatus"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Description |
| :------ | :------ |
| `SR` | Type of submit handler result. |

## Hierarchy

- `StateManager`<[`FormStatusData`](../interfaces/formstatusdata.md)<`SR`\>\>

  ↳ **`FormStatus`**

## Constructors

### constructor

• **new FormStatus**<`SR`\>(`form`)

#### Type parameters

| Name |
| :------ |
| `SR` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `form` | [`FormState`](formstate.md)<`any`, `any`, `any`, `any`\> |

#### Overrides

StateManager&lt;FormStatusData&lt;SR\&gt;\&gt;.constructor

## Properties

### form

• `Readonly` **form**: [`FormState`](formstate.md)<`any`, `any`, `any`, `any`\>

## Methods

### getState

▸ **getState**(): [`FormStatusData`](../interfaces/formstatusdata.md)<`SR`\>

#### Returns

[`FormStatusData`](../interfaces/formstatusdata.md)<`SR`\>

#### Inherited from

StateManager.getState

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
