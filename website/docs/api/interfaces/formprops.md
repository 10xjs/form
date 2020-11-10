---
id: "formprops"
title: "Interface: FormProps"
sidebar_label: "FormProps"
---

## Hierarchy

* **FormProps**

## Properties

### onError

• `Optional` **onError**: undefined \| (error: any) => void

Called when an exception is thrown during the form submit sequence. If not
defined any exception is re-thrown to surface as an unhandled promise
rejection.
