---
title: Imperative Interface
---

`@10xjs/form` provides direct access to its internal [`FormState`](/docs/api/classes/formstate) state machine allowing for programmatic form submission and field interaction.

## Accessing `FormState`

### `useForm` Hook

The [`useForm`](/docs/api/functions/useform) provides access to `FormState` in any child component with a `FormProvider` ancestor.

```tsx
import {FormProvider} from '@10xjs/form';
import {useForm} from 'react';

const Actions = () => {
  const form = useForm();

  return <button onClick={() => form.submit()}>Submit</button>;
};

const Example = () => {
  <FormProvider>
    <Actions />
  </FormProvider>;
};
```

### `FormProvider` Ref

The `FormProvider` component exposes the internal `FormState` instance. This approach allows access to `FormState` from outside `FormProvider` and can be used in combination with `forwardRef` for access anywhere in the entire component tree.

```tsx
import type {FormState, FormProps, FormProviderProps} from '@10xjs/form';
import {Form, FormProvider} from '@10xjs/form';
import {forwardRef} from 'react';

interface Values {
  field: string;
}

interface ExampleProps extends FormProps, Omit<FormProviderProps, 'children'> {}

const ExtendedFormProvider = forwardRef<FormState<Values>, ExampleProps>(
  (props, ref) => {
    const {values, onSubmit, validate, warn, ...baseProps} = props;

    return (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={onSubmit}
        validate={validate}
        warn={warn}
      >
        <Form {...props} />
      </FormProvider>
    );
  },
);
```

### `useFormState` Hook

It is possible to provide your own `FormState` context value by calling `useFormState` and rendering `formContext.provider` directly. This can help in cases where access to the `FormState` instance during the initial render is required.

```tsx
import {formContext, useFormState} from '@10xjs/form';

const Example = () => {
  const form = useFormState(
    {field: 'initial value'},
    {
      onSubmit: () => ({ok: true}),
    },
  );

  return (
    <formContext.provider value={form}>
      <button onClick={() => form.submit()}>Submit</button>
    </formContext.provider>
  );
};
```

:::caution

Combining `useFormState` with other hooks (`useField`, `useFormStatus` etc.) in a single component can result in an infinite update loop.

:::

The following example will result in an React state feedback loop. This happens because both the values object and `validate` handler fail strict equality checks between renders and trigger the form state machine to update its internal state as a result.

```tsx
import {formContext, useFormState} from '@10xjs/form';

interface Values {
  field: string;
}

const Example = () => {
  const form = useFormState(
    {field: 'initial value'},
    {
      onSubmit: () => ({ok: true}),
      validate: (values) => {
        const errors: Partial<Record<keyof Values, string>> = {};

        if (values.field === '') {
          errors[field] = 'Field is required';
        }

        return errors;
      },
    },
  );

  // This is not recommended. Using a separate component that calls `useField` is
  // a better approach under most circumstances.
  const [{value, error}, data] = useField(form);

  return (
    <formContext.provider value={form}>
      <input
        value={value}
        onFocus={() => field.focus()}
        onBlur={() => field.blur()}
        onChange={(event) => field.setValue(event.target.value)}
      />
      {error}
      <button onClick={() => form.submit()}>Submit</button>
    </formContext.provider>
  );
};
```

The best solution is to avoid structuring your form component like this (and to use [external field components](/docs/component-patterns#external-components)), however, you can work around the issue by using static values that do not change between render calls.

```tsx
import {formContext, useFormState} from '@10xjs/form';

interface Values {
  field: string;
}

const initialValues: Values = {
  field: 'initial value',
};

const validate = (values: Values) => {
  const errors: Partial<Record<keyof Values, string>> = {};

  if (values.field === '') {
    errors[field] = 'Field is required';
  }

  return errors;
};

const Example = () => {
  const form = useFormState(initialValues, {
    validate,
    onSubmit: () => ({ok: true}),
  });

  return <formContext.provider value={form}>...</formContext.provider>;
};
```

Or use React memoization hooks to update the values only when necessary.

```tsx
import {formContext, useFormState} from '@10xjs/form';
import {useMemo, useCallback} from 'react';

const Example = () => {
  const form = useFormState(
    useMemo(() => ({field: 'initial value'}), []),
    {
      validate: useCallback((values) => {
        const errors: Partial<Record<keyof typeof values, string>> = {};

        if (values.field === '') {
          errors[field] = 'Field is required';
        }

        return errors;
      }, []),
      onSubmit: () => ({ok: true}),
    },
  );

  return <formContext.provider value={form}>...</formContext.provider>;
};
```

## Programmatic Form Submission

[`FormState`](/docs/api/classes/formstate) exposes a `submit` method
