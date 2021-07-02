---
title: Persistent State
---

This example demonstrates subscribing to form state changes to persist field values to LocalStorage as an "autosave" mechanism.

```jsx
import {FormProvider, fields} from '10xjs/form';
import {useEffect, useState, useRef} from 'react';
```

```jsx live noInline
const defaultValues = {title: '', description: ''};

const Example = () => {
  const [key] = useState(() => `${location.pathname}:values`);

  const [initialValues] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(key)) || defaultValues;
    } catch (e) {
      return defaultValues;
    }
  });

  const subscriptionRef = useRef();

  const formRef = useCallback((form) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    if (form) {
      subscriptionRef.current = form.subscribe(() => {
        const {values} = form.getState();
        sessionStorage.setItem(key, JSON.stringify(values));
      });
    }
  }, []);

  return (
    <FormProvider
      ref={formRef}
      values={initialValues}
      onSubmit={() => ({ok: true})}
    >
      <Form>
        <label>
          Name
          <br />
          <fields.input path="title" />
        </label>

        <br />

        <label>
          Description
          <br />
          <fields.textarea path="description" />
        </label>

        <br />

        <button>submit</button>
      </Form>
    </FormProvider>
  );
};

render(<Example />);
```
