# @10xjs/form

> A high performance zero-config form state library for React.

[![Build Status](https://travis-ci.org/10xjs/form.svg?branch=master)](https://travis-ci.org/10xjs/form)
[![Coverage Status](https://coveralls.io/repos/github/10xjs/form/badge.svg?branch=master)](https://coveralls.io/github/10xjs/form?branch=master)

```jsx
import {Form, Field} from '@10xjs/form';

const FormComponent = () => (
  <Form
    values={{field: ''}}
    onSubmit={(values) => submitHandlerFunction(values)}
  >
    {({submit}) => (
      <form onSubmit={submit}>
        <Field path="field">{({props}) => <input {...props} />}</Field>
        <button>Submit form</button>
      </form>
    )}
  </Form>
);
```
