# @10xjs/form

_A high performance zero-config form state library for React._

![build status](http://img.shields.io/travis/10xjs/form/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/10xjs/form/master.svg?style=flat)

```jsx
import {Form, Field} from '@10xjs/form';

const FormComponent = () => (
  <Form
    values={{field: ''}}
    onSubmit={(values) => submitHandlerFunction(values)}
  >
    {({actions}) => (
      <form onSubmit={actions.submit}>
        <Field path="field">{({props}) => <input {...props} />}</Field>
        <button>Submit form</button>
      </form>
    )}
  </Form>
);
```
