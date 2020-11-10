---
id: "fieldpath"
title: "Type alias: FieldPath"
sidebar_label: "FieldPath"
---

Ƭ  **FieldPath**: string \| Array&#60;string \| number>

The path to a field within the form state as either a string or an array.

```js
const form = new FormState({
  foo: {
    bar: ['value'],
  },
}, ...);

// String path
form.getFieldValue('foo.bar[0]'); // 'value';

// Array path
form.getFieldValue(['foo', 'bar', 0]); // 'value';
```
