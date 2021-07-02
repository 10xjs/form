---
title: Frequently Asked Questions
---

### Can fields be connected using the HTML `name` attribute?

No. The property `path` used to map fields to the form value state is intentionally separate from the HTML `name` attribute. You can still use `name` on your inputs if you want to take advantage of native DOM features like autofill but it will not be directly referenced by this library.

### Does it work with class components?

The API of this library is designed specifically for use with React hooks which can't be used in class components, although it is possible to use class components by wrapping them in function components or by using `<formContext.consumer>` directly.

### How can I define validation on an individual field?

Validation can only be defined as a function of the entire form state at the root level.

### How do I create multi-step or tabbed forms?

The recommended approach to multi-step forms is to construct them as a series of distinct forms with shared state.

```jsx live noInline
const Example = () => {
  const [page, setPage] = useState(1);

  const [values, setValues] = useState({
    fieldOne: '',
    fieldTwo: '',
    sharedField: false,
  });

  return page === 1 ? (
    <FormProvider
      values={values}
      validate={(_values) => {
        return _values.fieldOne === '' ? {fieldOne: 'required'} : '';
      }}
      onSubmit={(_values) => {
        setValues(_values);
        setPage(2);
      }}
    >
      <label>
        Shared Field <fields.input type="checkbox" path="sharedField" />
      </label>
      <br />
      <label>
        Field Two <fields.input path="fieldOne" />
      </label>
    </FormProvider>
  ) : (
    <FormProvider
      values={values}
      validate={(_values) => {
        return _values.fieldTwo === '' ? {fieldTwo: 'required'} : '';
      }}
      onSubmit={(_values) => {
        console.log('final values', _values);
      }}
    >
      <label>
        Shared Field <fields.input type="checkbox" path="sharedField" />
      </label>
      <br />
      <label>
        Field Two <fields.input path="fieldTwo" />
      </label>
    </FormProvider>
  );
};

render(<Example />);
```

### Why doesn't `useField` return `onChange`, `onFocus`, and `onBlur` event handler props?

### Do I need to create separate components for each field?
