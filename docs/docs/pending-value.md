---
title: Pending Field Values
---

```jsx live noInline
const Field = () => {
  const [{detached, value, initialValue, pendingValue}, field] =
    useField('field');

  return (
    <div>
      <pre>{JSON.stringify({value, initialValue, pendingValue}, null, 2)}</pre>
      <fields.input path="field" />
      {detached ? (
        <div>
          Overwrite the local value with the new current value "{pendingValue}"?
          <br />
          <button type="button" onClick={() => field.acceptPendingValue()}>
            overwrite
          </button>
          <button type="button" onClick={() => field.rejectPendingValue()}>
            keep local value
          </button>
        </div>
      ) : null}
    </div>
  );
};

const Example = () => {
  const [values, setValues] = useState({field: 'initial value'});

  return (
    <FormProvider values={values}>
      <Field />
      <br />
      <button type="button" onClick={() => setValues({field: 'new value'})}>
        Change Initial Value
      </button>
    </FormProvider>
  );
};

render(<Example />);
```
