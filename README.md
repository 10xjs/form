# @10xjs/form

[![build status](https://img.shields.io/circleci/project/github/10xjs/form/master.svg)](https://circleci.com/gh/10xjs/form)
[![coverage](https://codecov.io/gh/10xjs/form/branch/master/graph/badge.svg)](https://codecov.io/gh/10xjs/form)
[![license](https://img.shields.io/npm/l/@10xjs/form.svg)](LICENSE)
[![npm](https://img.shields.io/npm/dw/@10xjs/form.svg)](https://www.npmjs.com/package/@10xjs/form)
[![maintainability](https://api.codeclimate.com/v1/badges/765fb5a2f1be1f7eb075/maintainability)](https://codeclimate.com/github/10xjs/form/maintainability)

> A high performance zero-config form state library for React.

#### Basic Example

```jsx
import {Form, useField, input} from '@10xjs/form';

const Input = ({path}) => <input {...input(useField(path))} />;

const Fields = () => {
  const {submit} = useForm();
  return (
    <form onSubmit={submit}>
      <Input path="path" />
      <button type="submit">Submit form</button>
    </form>
  );
};

const ConsumerComponent = () => (
  <Form
    values={{field: ''}}
    onSubmit={(values) => submitHandlerFunction(values)}
  >
    <Fields />
  </Form>
);
```

#### Typescript Example

```tsx
import * as FormModule from '@10xjs/form';

type Values = {
  /* ... */
};

type Result = {
  /* ... */
};

const {Form, useContext, input} = FormModule as FormModule.TypedModule<
  Values,
  Result
>;

type FieldError = {
  /* ... */
};

type FieldWarning = {
  /* ... */
};

interface ErrorProps {
  field: FormModule.FieldInterface<any, FieldError, FieldWarning>;
}

const Error = ({path}: {path: FormModule.Path}) => {
  const {error, touched} = useField(path);
  const {submitFailed} = useStatus();

  if ((touched || submitFailed) && error !== null) {
    return <div>{error}</div>;
  }
  return null;
};

const Input = ({path}: {path: FormModule.Path}) => {
  const field = useField(path);

  return <input {...input(field)} />;
};

const Fields = () => {
  const {submit} = useContext();
  return (
    <form onSubmit={submit}>
      <Input path="path" />
      <Error path="path" />
      <button type="submit">Submit form</button>
    </form>
  );
};

const ConsumerComponent = () => (
  <Form
    values={{field: ''}}
    onSubmit={(values: Values): Result => submitHandlerFunction(values)}
  >
    <Fields />
  </Form>
);
```

#### Typescript Ref Interface Example

```tsx
import * as FormModule from '@10xjs/form';

type Values = {
  /* ... */
};

type Result = {
  /* ... */
};

const ModuleType = FormModule.TypedModule<Values, Result>;
type Interface = FormModule.FormInterfaceOf<ModuleType>;

const {Form} = FormModule as ModuleType;

const ConsumerComponent = () => (
  const ref = React.useRef<Interface>();

  <Form
    ref={ref}
    values={{field: ''}}
    onSubmit={(values: Values): Result => submitHandlerFunction(values)}
  >
    <form onSubmit={(event) => (ref.current as Interface).submit(event)}>
      ...
    </form>
  </Form>
);
```

#### Typescript `useForm` Hook Example

```tsx
import * as FormModule from '@10xjs/form';

type Values = {
  /* ... */
};

type Result = {
  /* ... */
};

const ModuleType = FormModule.TypedModule<Values, Result>;
type Interface = FormModule.FormInterfaceOf<ModuleType>;

const {useForm, FormProvider} = FormModule as ModuleType;

const ConsumerComponent = () => (
  const form = useForm({
    values,
    onSubmit,
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.submit}>
        ...
      </form>
    </FormProvider>
  );
);
```
