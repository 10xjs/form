---
id: "formstatus"
title: "Class: FormStatus<SR>"
sidebar_label: "FormStatus"
---

## Type parameters

Name | Description |
------ | ------ |
`SR` | Type of submit handler result.  |

## Hierarchy

* [StateManager](statemanager.md)&#60;[FormStatusData](../interfaces/formstatusdata.md)&#60;SR>>

  ↳ **FormStatus**

## Implements

* [Subscribable](../interfaces/subscribable.md)&#60;[FormStatusData](../interfaces/formstatusdata.md)&#60;SR>>

## Constructors

### constructor

\+ **new FormStatus**(`form`: [FormState](formstate.md)&#60;any, any, any, any>): [FormStatus](formstatus.md)

*Overrides [StateManager](statemanager.md).[constructor](statemanager.md#constructor)*

#### Parameters:

Name | Type |
------ | ------ |
`form` | [FormState](formstate.md)&#60;any, any, any, any> |

**Returns:** [FormStatus](formstatus.md)

## Properties

### form

• `Readonly` **form**: [FormState](formstate.md)&#60;any, any, any, any>

## Methods

### getState

▸ **getState**(): T

*Inherited from [StateManager](statemanager.md).[getState](statemanager.md#getstate)*

**Returns:** T

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
