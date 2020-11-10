---
id: "fielddata"
title: "Interface: FieldData<T>"
sidebar_label: "FieldData"
---

## Type parameters

Name | Description |
------ | ------ |
`T` | Field value type.  |

## Hierarchy

* **FieldData**

## Properties

### detached

•  **detached**: boolean

True if the current value is different from the pending value.

___

### dirty

•  **dirty**: boolean

True if the current value is different from the initial value.

___

### error

•  **error**: unknown

The current field error value.

___

### focused

•  **focused**: boolean

True if the field is currently focused.

___

### initialValue

•  **initialValue**: T

The initial value set set by an update to the root form value state.

___

### pendingValue

•  **pendingValue**: T

The pending value set set by an update to the root form value state.

___

### touched

•  **touched**: boolean

True if the field value has been edited.

___

### value

•  **value**: T

The current value of the field.

___

### visited

•  **visited**: boolean

True if the field is has been or is currently focused.

___

### warning

•  **warning**: unknown

The current field warning value.
