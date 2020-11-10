---
id: "setvalueaction"
title: "Type alias: SetValueAction<T>"
sidebar_label: "SetValueAction"
---

Ƭ  **SetValueAction**&#60;T>: T \| (currentValue: T) => T

A value passed to [FormState.setFieldValue](../classes/formstate.md#setfieldvalue). If defined as a function
it will be be called with the previous value to return an updated value.

```js
const form = new FormState({name: 'name'}, ...);

form.setFieldValue('name', 'updated');

form.getFieldValue('name'); // 'updated'

form.setFieldValue('name', (value) => value + ' again');

form.getFieldValue('name'); // 'updated again'
```

#### Type parameters:

Name | Description |
------ | ------ |
`T` | Field value type.  |
