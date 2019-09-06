import * as React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '@testing-library/react';

import * as Form from '../';

import {Esimorp} from './Esimorp';

describe('<Form>', () => {
  it('should return children', () => {
    const result = render(
      <Form.Form values={{}}>
        <form />
      </Form.Form>,
    );

    expect(result.container).toMatchInlineSnapshot(`
      <div>
        <form />
      </div>
    `);
  });

  it('should call validate with initial values on first mount', () => {
    const values = {foo: 'bar'};
    const validate = jest.fn<void, [{foo: any}]>();

    render(<Form.Form values={values} validate={validate} />);

    // Expect validate to be called only once per update.
    expect(validate).toHaveBeenCalledTimes(1);

    // Expect validate to have been called with the correct arguments.
    expect(validate).toHaveBeenLastCalledWith(values);
  });

  it('should call validate with current values when validate is updated', () => {
    const values = {foo: 'bar'};

    const TypedForm = Form as Form.TypedModule<typeof values, void, void, void>;

    const {rerender} = render(<TypedForm.Form values={values} />);

    const validate = jest.fn<void, [{foo: any}]>();

    rerender(<TypedForm.Form values={values} validate={validate} />);

    // Expect incoming validate to be called immediately.
    expect(validate).toHaveBeenCalledTimes(1);

    // Expect validate to have been called with the correct arguments.
    expect(validate).toHaveBeenLastCalledWith(values);
  });

  it('should call validate with updated values when value state changes', () => {
    const values = {foo: 'bar'};

    type ModuleType = Form.TypedModule<typeof values, void, void, void>;

    type FormInterface = Form.InterfaceOf<ModuleType>;

    const {Form: FormComponent} = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const validate = jest.fn<void, [{foo: any}]>();

    render(<FormComponent ref={ref} values={values} validate={validate} />);

    expect(validate).toHaveBeenLastCalledWith(values);

    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated');
    });

    // Expect validate to be called only once per state update.
    expect(validate).toHaveBeenCalledTimes(2);

    expect(validate).toHaveBeenLastCalledWith(
      expect.objectContaining({foo: 'updated'}),
    );
  });

  it('should not call validate with when other state changes', () => {
    interface Values {
      foo?: any;
    }

    type ModuleType = Form.TypedModule<Values, void, void, void>;

    type FormInterface = Form.InterfaceOf<ModuleType>;

    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const validate = jest.fn<void, [Values]>();

    render(<TypedForm.Form ref={ref} values={{}} validate={validate} />);

    act(() => {
      (ref.current as FormInterface).focus('foo');
      (ref.current as FormInterface).blur('foo');
    });

    // Expect validate to be called only once.
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('should not call validate with when the values prop changes', () => {
    const validate = jest.fn<void, [{foo: any}]>();

    const {rerender} = render(
      <Form.Form values={{foo: 'bar'}} validate={validate} />,
    );

    rerender(<Form.Form values={{foo: 'pending'}} validate={validate} />);

    // Expect validate to be called only once.
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('should call warn with initial values on first mount', () => {
    const values = {foo: 'bar'};
    const warn = jest.fn<void, [{foo: any}]>();

    render(<Form.Form values={values} warn={warn} />);

    // Expect warn to be called only once per update.
    expect(warn).toHaveBeenCalledTimes(1);

    // Expect warn to have been called with the correct arguments.
    expect(warn).toHaveBeenLastCalledWith(values);
  });

  it('should call validate with current values when warn is updated', () => {
    const values = {foo: 'bar'};

    const {rerender} = render(<Form.Form values={values} />);

    const warn = jest.fn<void, [{foo: any}]>();

    rerender(<Form.Form values={values} warn={warn} />);

    // Expect incoming warn to be called immediately.
    expect(warn).toHaveBeenCalledTimes(1);

    // Expect warn to have been called with the correct arguments.
    expect(warn).toHaveBeenLastCalledWith(values);
  });

  it('should call warn with updated values when value state changes', () => {
    const values = {foo: 'bar'};

    type ModuleType = Form.TypedModule<typeof values, void, void, void, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const warn = jest.fn<void, [{foo: any}]>();

    render(<TypedForm.Form ref={ref} values={values} warn={warn} />);

    expect(warn).toHaveBeenLastCalledWith(values);

    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated');
    });

    // Expect warn to be called only once per state update.
    expect(warn).toHaveBeenCalledTimes(2);

    expect(warn).toHaveBeenLastCalledWith(
      expect.objectContaining({foo: 'updated'}),
    );
  });

  it('should not call warn with when other state changes', () => {
    type ModuleType = Form.TypedModule<{}, void, void, void, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const warn = jest.fn<void, [{}]>();

    render(<TypedForm.Form ref={ref} values={{}} warn={warn} />);

    act(() => {
      (ref.current as FormInterface).focus('foo');
      (ref.current as FormInterface).blur('foo');
    });

    // Expect warn to be called only once.
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('should not call warn with when the values prop changes', () => {
    const values = {foo: 'bar'};

    type ModuleType = Form.TypedModule<typeof values, void, void, void, void>;

    const TypedForm = Form as ModuleType;

    const warn = jest.fn<void, [{foo: any}]>();

    const {rerender} = render(<TypedForm.Form values={values} warn={warn} />);

    rerender(<TypedForm.Form values={{foo: 'pending'}} warn={warn} />);

    // Expect warn to be called only once.
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmit with current values', async () => {
    const success = new Esimorp();

    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const values = {};

    const onSubmit = jest.fn<void, [typeof values]>();

    render(
      <TypedForm.Form
        ref={ref}
        values={values}
        onSubmit={onSubmit}
        onSubmitSuccess={() => {
          success.resolve();
        }}
      />,
    );

    act(() => {
      (ref.current as FormInterface).submit();
    });

    await success;

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenLastCalledWith(values);
  });

  it('should call correct handlers handler props on successful submit', async () => {
    const submitResult = {};

    type ModuleType = Form.TypedModule<{}, typeof submitResult>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const success = new Esimorp<typeof submitResult>();

    const onSubmitSuccess = jest.fn(success.resolve);
    const onSubmitFail = jest.fn();

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.resolve(submitResult)}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    await act(async () => {
      (ref.current as FormInterface).submit();
      await success;
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onSubmitFail).toHaveBeenCalledTimes(0);

    expect(onSubmitSuccess).toHaveBeenLastCalledWith(submitResult);
  });

  it('should complete submit sequence if the component is unmounted', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const success = new Esimorp<void>();

    const onSubmit = jest.fn();
    const onSubmitSuccess = jest.fn(success.resolve);

    await act(async () => {
      const {unmount} = render(
        <TypedForm.Form
          ref={ref}
          values={{}}
          onSubmit={onSubmit}
          onSubmitSuccess={onSubmitSuccess}
        />,
      );

      const {submit} = ref.current as FormInterface;

      unmount();

      submit();

      await success;
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior of event passed to submit', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();
    const event = {preventDefault: jest.fn()};

    const success = new Esimorp<void>();

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmitSuccess={success.resolve}
      />,
    );

    await act(async () => {
      (ref.current as FormInterface).submit(event as any);

      await success;
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should call correct handlers on attempted submit with local validation errors', async () => {
    type ModuleType = Form.TypedModule<{}, void, void, string>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const fail = new Esimorp<void>();

    const onSubmitSuccess = jest.fn();
    const onSubmitFail = jest.fn(() => {
      fail.resolve();
    });

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        validate={() => 'errors'}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    await act(async () => {
      (ref.current as FormInterface).submit();

      await fail;
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(0);
    expect(onSubmitFail).toHaveBeenCalledTimes(1);

    expect(onSubmitFail).toHaveBeenLastCalledWith(
      expect.any(Form.SubmitValidationError),
    );
  });

  it('should call correct handlers on attempted submit with remote validation errors', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const validationError = new Form.SubmitValidationError('errors');

    const fail = new Esimorp<Form.SubmitValidationError>();

    const onSubmitSuccess = jest.fn();
    const onSubmitFail = jest.fn(() => {
      fail.resolve();
    });

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.reject(validationError)}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    await act(async () => {
      (ref.current as FormInterface).submit();

      await fail;
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(0);
    expect(onSubmitFail).toHaveBeenCalledTimes(1);

    expect(onSubmitFail).toHaveBeenLastCalledWith(validationError);
  });

  it('should call correct handlers on attempted submit with empty remote validation error', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const validationError = new Form.SubmitValidationError({});

    const fail = new Esimorp<Form.SubmitValidationError>();

    const onSubmitSuccess = jest.fn();
    const onSubmitFail = jest.fn(() => {
      fail.resolve();
    });

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.reject(validationError)}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    await act(async () => {
      (ref.current as FormInterface).submit();

      await fail;
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(0);
    expect(onSubmitFail).toHaveBeenCalledTimes(1);

    expect(onSubmitFail).toHaveBeenLastCalledWith(validationError);
  });

  it('should call correct handlers on attempted submit with unexpected error', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const unexpectedError = new Error();

    const fail = new Esimorp<Error>();

    const onSubmitSuccess = jest.fn();
    const onSubmitFail = jest.fn(() => {
      fail.resolve();
    });

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => {
          throw unexpectedError;
        }}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    act(() => {
      (ref.current as FormInterface).submit();
    });

    await fail;

    expect(onSubmitSuccess).toHaveBeenCalledTimes(0);
    expect(onSubmitFail).toHaveBeenCalledTimes(1);

    expect(onSubmitFail).toHaveBeenLastCalledWith(unexpectedError);
  });

  it('should call correct handlers on attempted submit with unexpected rejection', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const unexpectedError = new Error();

    const fail = new Esimorp<Error>();

    const onSubmitSuccess = jest.fn();
    const onSubmitFail = jest.fn(() => {
      fail.resolve();
    });

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.reject(unexpectedError)}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    await act(async () => {
      (ref.current as FormInterface).submit();

      await fail;
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(0);
    expect(onSubmitFail).toHaveBeenCalledTimes(1);

    expect(onSubmitFail).toHaveBeenLastCalledWith(unexpectedError);
  });

  it('should call correct handlers on attempted submit if a submit is in progress', async () => {
    type ModuleType = Form.TypedModule<{}, void>;
    type FormInterface = Form.InterfaceOf<ModuleType>;
    const TypedForm = Form as ModuleType;

    const ref = React.createRef<FormInterface>();

    const fail = new Esimorp<Error>();

    const onSubmitSuccess = jest.fn();
    const onSubmitFail = jest.fn(() => {
      fail.resolve();
    });

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.resolve()}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitFail={onSubmitFail}
      />,
    );

    act(() => {
      (ref.current as FormInterface).submit();
      (ref.current as FormInterface).submit();
    });

    await act(async () => {
      await fail;
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onSubmitFail).toHaveBeenCalledTimes(1);

    expect(onSubmitFail).toHaveBeenLastCalledWith(
      expect.any(Form.SubmitConcurrencyError),
    );
  });
});
