---
id: "formstatusdata"
title: "Interface: FormStatusData<SR>"
sidebar_label: "FormStatusData"
---

## Type parameters

Name |
------ |
`SR` |

## Hierarchy

* **FormStatusData**

## Properties

### error

•  **error**: [SubmitError](../classes/submiterror.md) \| null

Submit result error.

___

### hasErrors

•  **hasErrors**: boolean

True if any field validation errors currently exist.

___

### hasSubmitErrors

•  **hasSubmitErrors**: boolean

True if any field submit validation errors currently exist.

___

### hasWarnings

•  **hasWarnings**: boolean

True if any field validation warnings currently exist.

___

### result

•  **result**: SR \| null

Submit result.

___

### submitFailed

•  **submitFailed**: boolean

True if the form has been submitted and the immediate submit has failed.

___

### submitSucceeded

•  **submitSucceeded**: boolean

True if the form has been submitted and the immediate submit has succeeded.

___

### submitting

•  **submitting**: boolean

True if the form has been submitted and is submit resolution is pending.
