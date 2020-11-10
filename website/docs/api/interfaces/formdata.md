---
id: "formdata"
title: "Interface: FormData<VS, SD, ES, WS>"
sidebar_label: "FormData"
---

## Type parameters

Name | Description |
------ | ------ |
`VS` | Type of form value state. |
`SD` | Type of submit handler result. |
`ES` | Type of form error state. |
`WS` | Type of form warning state.  |

## Hierarchy

* **FormData**

## Properties

### error

• `Optional` **error**: [SubmitError](../classes/submiterror.md)

___

### errors

• `Optional` **errors**: ES

___

### focusedPath

• `Optional` **focusedPath**: undefined \| string

___

### initialValues

•  **initialValues**: VS

___

### pendingValues

•  **pendingValues**: VS

___

### result

• `Optional` **result**: SD

___

### submitErrors

• `Optional` **submitErrors**: ES

___

### submitStatus

•  **submitStatus**: [FormSubmitStatus](../enums/formsubmitstatus.md)

___

### touchedMap

•  **touchedMap**: Record&#60;string, boolean>

___

### values

•  **values**: VS

___

### visitedMap

•  **visitedMap**: Record&#60;string, boolean>

___

### warnings

• `Optional` **warnings**: WS
