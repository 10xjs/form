---
title: 'Basic Example'
sidebar_label: 'Basic'
---

```jsx live
function Example() {
  const values = React.useMemo(
    () => ({
      name: 'name',
    }),
    [],
  );

  const Result = React.useCallback(() => {
    const [data] = useFormStatus();
    return <div>{data.result}</div>;
  }, []);

  return (
    <FormProvider
      values={values}
      onSubmit={(values) => ({
        ok: true,
        data: 'Hello ' + values.name + '!',
      })}
    >
      <Form>
        <fields.input path="name" />
        <br />
        <button>submit</button>
      </Form>

      <Result />
    </FormProvider>
  );
}
```
