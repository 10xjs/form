# @10xjs/form

[![build status](https://img.shields.io/circleci/project/github/10xjs/form/master.svg)](https://circleci.com/gh/10xjs/form)
[![coverage](https://codecov.io/gh/10xjs/form/branch/master/graph/badge.svg)](https://codecov.io/gh/10xjs/form)
[![license](https://img.shields.io/npm/l/@10xjs/form.svg)](LICENSE)
[![npm](https://img.shields.io/npm/dw/@10xjs/form.svg)](https://www.npmjs.com/package/@10xjs/form)
[![maintainability](https://api.codeclimate.com/v1/badges/765fb5a2f1be1f7eb075/maintainability)](https://codeclimate.com/github/10xjs/form/maintainability)

> A high performance zero-config form state library for React.

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
