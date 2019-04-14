# @10xjs/form

> A high performance zero-config form state library for React.

[![CircleCI](https://circleci.com/gh/10xjs/form.svg?style=svg)](https://circleci.com/gh/10xjs/form)
[![codecov](https://codecov.io/gh/10xjs/form/branch/master/graph/badge.svg)](https://codecov.io/gh/10xjs/form)

```jsx
import {Form, Field} from '@10xjs/form';

const FormComponent = () => (
  <Form
    values={{field: ''}}
    onSubmit={(values) => submitHandlerFunction(values)}
  >
    {({submit}) => (
      <form onSubmit={submit}>
        <Field path="field">{({input}) => <input {...input} />}</Field>
        <button>Submit form</button>
      </form>
    )}
  </Form>
);
```
