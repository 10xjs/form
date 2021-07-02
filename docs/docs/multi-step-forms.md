---
title: Multi-Step Forms
---

## Multiple Form Contexts

#### Advantages

- Using `onSubmit` to transition between steps makes validating each step simple.
- Takes advantage of the decoupling between fields and value state that is core to the design of this library.

#### Disadvantages

- Requires external state to keep track of the field values across steps.

```jsx live noInline
const Example = () => {
  const [step, setStep] = useState(1);

  const [values, setValues] = useState({
    fieldOne: '',
    fieldTwo: '',
    sharedField: false,
  });

  return (
    <>
      <pre>{JSON.stringify(values, null, 2)}</pre>
      {step === 1 ? (
        <FormProvider
          key="step1"
          values={values}
          validate={(_values) => {
            return _values.fieldOne === '' ? {fieldOne: 'required'} : {};
          }}
          onSubmit={(_values) => {
            console.log('submit', values);
            setValues(_values);
            setStep(2);
          }}
        >
          <Form>
            Step One
            <br />
            <label>
              Shared Field <fields.input type="checkbox" path="sharedField" />
            </label>
            <br />
            <label>
              Field One <fields.input path="fieldOne" />
            </label>
            <br />
            <button type="submit">Next</button>
          </Form>
        </FormProvider>
      ) : (
        <FormProvider
          key="step2"
          values={values}
          validate={(_values) => {
            return _values.fieldTwo === '' ? {fieldTwo: 'required'} : {};
          }}
          onSubmit={(_values) => {
            alert('success\n' + JSON.stringify(_values, null, 2));
          }}
        >
          <Form>
            Step Two
            <br />
            <label>
              Shared Field <fields.input type="checkbox" path="sharedField" />
            </label>
            <br />
            <label>
              Field Two <fields.input path="fieldTwo" />
            </label>
            <br />
            <button
              type="button"
              onClick={(event) => {
                setStep(1);
              }}
            >
              Back
            </button>{' '}
            <button type="submit">Submit</button>
          </Form>
        </FormProvider>
      )}
    </>
  );
};

render(<Example />);
```

## Single Form Context

#### Advantages

- Easier to share visual elements across form steps without creating shared components.

#### Disadvantages

- More complicated validation definition that depends on the current step.
- Requires a ref and imperative calls to [FormState.hasErrors](/docs/api/classes/formstate#haserrors) to enforce per-step validation.

```jsx live noInline
const Example = () => {
  const [step, setStep] = useState(1);

  const formRef = useRef();

  return (
    <FormProvider
      ref={formRef}
      values={{
        fieldOne: '',
        fieldTwo: '',
        sharedField: false,
      }}
      validate={(values) => {
        const errors = {};

        if (step === 1 && values.fieldOne === '') {
          errors.fieldOne === 'required';
        }

        if (step === 2 && values.fieldTwo === '') {
          errors.fieldTwo === 'required';
        }

        return errors;
      }}
      onSubmit={(values) => {
        alert('success\n' + JSON.stringify(values, null, 2));
      }}
    >
      <Form>
        Step {step === 1 ? 'One' : 'Two'}
        <br />
        <label>
          Shared Field <fields.input type="checkbox" path="sharedField" />
        </label>
        <br />
        {step === 1 ? (
          <>
            <label>
              Field One <fields.input path="fieldOne" />
            </label>
            <br />
            <button
              type="button"
              onClick={(event) => {
                if (!formRef.current.hasErrors()) {
                  setStep(2);
                }
              }}
            >
              Next
            </button>
          </>
        ) : (
          <>
            <label>
              Field Two <fields.input path="fieldTwo" />
            </label>
            <br />
            <button
              type="button"
              onClick={(event) => {
                setStep(1);
              }}
            >
              Back
            </button>{' '}
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </FormProvider>
  );
};

render(<Example />);
```
