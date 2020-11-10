---
id: "statemanager"
title: "Class: StateManager<T>"
sidebar_label: "StateManager"
---

## Type parameters

Name |
------ |
`T` |

## Hierarchy

* **StateManager**

  ↳ [FormState](formstate.md)

  ↳ [Field](field.md)

  ↳ [FieldStatus](fieldstatus.md)

  ↳ [FormStatus](formstatus.md)

## Implements

* [Subscribable](../interfaces/subscribable.md)&#60;T>

## Constructors

### constructor

\+ **new StateManager**(`state`: T, `onStart?`: undefined \| () => void, `onPause?`: undefined \| () => void): [StateManager](statemanager.md)

#### Parameters:

Name | Type |
------ | ------ |
`state` | T |
`onStart?` | undefined \| () => void |
`onPause?` | undefined \| () => void |

**Returns:** [StateManager](statemanager.md)

## Methods

### getState

▸ **getState**(): T

**Returns:** T

___

### subscribe

▸ **subscribe**(`subscriber`: () => void): object

#### Parameters:

Name | Type |
------ | ------ |
`subscriber` | () => void |

**Returns:** object

Name | Type |
------ | ------ |
`unsubscribe` | () => void |
