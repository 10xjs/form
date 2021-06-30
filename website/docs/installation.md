---
title: Installation & Usage
---

First install the module via `yarn` or `npm`:

```bash npm2yarn
npm install --save @10xjs/form
```

## Basic Usage

```jsx
import {fields, Form, FormProvider, useFormStatus} from '@10xjs/form';
```

```jsx live noInline
const handleSubmit = (values) => {
  if (values.username !== '' && values.password !== '') {
    return {ok: true};
  }

  return {ok: false};
};

const Basic = () => {
  return (
    <FormProvider
      values={{
        username: '',
        password: '',
      }}
      onSubmit={handleSubmit}
    >
      {(form) => {
        const [status] = useFormStatus(form);

        if (status.submitSucceeded) {
          return <div>Success!</div>;
        }

        return (
          <Form noValidate>
            {status.submitFailed && <div>Invalid username or password</div>}
            <div>
              <label htmlFor="username">Username</label>
              <br />
              <fields.input id="username" path="username" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <br />
              <fields.input id="password" path="password" type="password" />
            </div>

            <div>
              <button>submit</button>
            </div>
          </Form>
        );
      }}
    </FormProvider>
  );
};

render(Basic);
```

## Field Mapping

A core concept of `@10xjs/form` is a clean separation of form state and any inputs that interact with it. Each input is mapped to a slice of the form value state through the `path` prop. Field state is not directly accessible from your outer form component and should be accessed using [`useField`](/docs/api/functions/usefield) (or the utility [`fields.*`](/docs/api/variables/fields.input) components). This pattern ensures that changes to the state of one field do not propagate as render updates to the entire form. A mapped field only re-renders when state under its `path` changes.

#### Custom mapped input example

```jsx
import {TextField} from '@material-ui/core';

const Field = (path) => {
  const {path, ...TextFieldProps} = props;

  const [data, field] = useField(path);

  let error;

  if (data.touched) {
    error = data.error;
  }

  return (
    <TextField
      {...TextFieldProps}
      error={!!error}
      value={data.value}
      onFocus={() => field.focus()}
      onBlur={() => field.blur()}
      onChange={(event) => {
        field.setValue(event.target.value);
      }}
      helperText={error}
    />
  );
};

const ExampleForm = () => {
  return (
    <FormProvider
      values={{
        fieldA: 'example initial value',
        fieldB: 'example initial value',
      }}
      onSubmit={handleSubmit}
    >
      <Field path="fieldA" label="Field A" />
      <Field path="fieldB" label="Field B" />
    </FormProvider>
  );
};
```

The `path` of each field can map to any part of the form value state and can even share state with other fields. The [`useField` hook](/docs/api/functions/usefield) is very handy for accessing state values - mapping to an input is not required!

#### Non-input `useField` example

```jsx
const Summary = () => {
  const [data] = useField('entries');
  const entries = data.value;

  return <div>{entries.length} entries</div>;
};

const ExampleForm = () => {
  return (
    <FormProvider
      values={{
        entries: {
          a: {name: 'entry a', description: ''},
          b: {name: 'entry b', description: ''},
          c: {name: 'entry c', description: ''},
        },
      }}
      onSubmit={handleSubmit}
    >
      <fields.input path="entries.a.name" placeholder="Name A" />
      <fields.input path="entries.a.description" placeholder="Description A" />

      <fields.input path="entries.b.name" placeholder="Name B" />
      <fields.input path="entries.b.description" placeholder="Description B" />

      <fields.input path="entries.c.name" placeholder="Name C" />
      <fields.input path="entries.c.description" placeholder="Description C" />

      <Summary />
    </FormProvider>
  );
};
```

## Validation & Submit

`@10xjs/form` handles validation as a single operation on the entire form value state through a [`validate` callback](/docs/api/interfaces/formoptions#validate). Validation errors are mapped to each field using the same `path` used to map value.

The `validate` callback is called whenever _any_ part of the form value state changes or when the `validate` function itself changes (it may be necessary to wrap an inline `validate` function in `useCallback` to avoid unnecessary updates in some cases).

Each connected field has access to the current error state. Since validation is run continuously, use [`touched`](/docs/api/interfaces/fielddata#touched), [`dirty`](/docs/api/interfaces/fielddata#dirty), and [`visited`](/docs/api/interfaces/fielddata#visited) to conditionally display error messages at the field level.

#### Sync validation example

```jsx
const Field = (props) => {
  const [data] = useField(path);

  let error;

  if (data.touched) {
    error = data.error;
  }

  return (
    <label>
      {props.label}
      <br />
      <fields.input path={props.path} />
      {!!error && <div>{error}</div>}
    </label>
  );
};

const ExampleForm = () => {
  return (
    <FormProvider
      values={{
        username: '',
        password: '',
      }}
      validate={(values) => {
        const errors = {};

        if (values.username === '') {
          errors.username === 'Username is required.';
        }

        if (values.password === '') {
          errors.password === 'Password is required.';
        }

        return {};
      }}
      onSubmit={handleSubmit}
    >
      <Form>
        <Field path="username" label="Username" />
        <Field path="password" label="Password" />
      </Form>

      <button>Submit</button>
    </FormProvider>
  );
};
```

Validation errors can also be returned from the [`onSubmit` handler](/docs/api/interfaces/formoptions#onsubmit) by returning a [`SubmitValidationError`](/docs/api/classes/submitvalidationerror) instance. This provides a mechanism to integrate API validation errors and to handle more expensive or async local validation operations.

The `onSubmit` callback must return a [`SubmitResult`](/docs/api/types/submitresult) value (or a `Promise` resolving a `SubmitResult` value) with `ok` and `data`/`error` properties.

#### Submit validation example

```jsx
const ExampleForm = () => {
  return (
    <FormProvider
      values={{
        username: '',
        password: '',
      }}
      onSubmit={(values) => {
        const errors = {};

        if (values.username === '') {
          errors.username === 'Username is required.';
        }

        if (values.password === '') {
          errors.password === 'Password is required.';
        }

        if (Object.keys(errors).length) {
          return {ok: false, error: new SubmitValidationError(errors)};
        }

        return {ok: true};
      }}
    >
      <Form>
        <Field path="username" label="Username" />
        <Field path="password" label="Password" />
      </Form>

      <button>Submit</button>
    </FormProvider>
  );
};
```
