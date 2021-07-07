import * as React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '@testing-library/react';
import {FormState} from '../core/formState';

import {FormProvider, useForm} from './context';

describe('useContext hook', () => {
  it('should throw an error if the context provider is missing', () => {
    const ContextConsumer = (): null => {
      useForm();
      return null;
    };

    const error = console.constructor.prototype.error;

    console.error = () => {};

    expect(() => render(<ContextConsumer />)).toThrow(
      'Form context provider is missing.',
    );

    console.constructor.prototype.error = error;
  });
});

describe('<FormProvider>', () => {
  it('should return children', () => {
    const result = render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <form />
      </FormProvider>,
    );

    expect(result.container).toMatchInlineSnapshot(`
      <div>
        <form />
      </div>
    `);
  });

  it('should call validate with initial values on first mount', () => {
    const values = {foo: 'bar'};
    const validate = jest.fn<null, [{foo: any}]>(() => null);

    render(
      <FormProvider
        values={values}
        validate={validate}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    // Expect validate to be called only once per update.
    expect(validate).toHaveBeenCalledTimes(1);

    // Expect validate to have been called with the correct arguments.
    expect(validate).toHaveBeenLastCalledWith(values);
  });

  it('should call validate with current values when validate is updated', () => {
    const values = {foo: 'bar'};

    const {rerender} = render(
      <FormProvider
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    const validate = jest.fn<undefined, [{foo: any}]>();

    rerender(
      <FormProvider
        values={values}
        validate={validate}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    // Expect incoming validate to be called immediately.
    expect(validate).toHaveBeenCalledTimes(1);

    // Expect validate to have been called with the correct arguments.
    expect(validate).toHaveBeenLastCalledWith(values);
  });

  it('should call validate with updated values when value state changes', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, void, any, any>>();

    const validate = jest.fn<undefined, [{foo: any}]>();

    render(
      <FormProvider
        ref={ref}
        values={values}
        validate={validate}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    expect(validate).toHaveBeenLastCalledWith(values);

    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated');
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

    const ref = React.createRef<FormState<Values, void, any, any>>();

    const validate = jest.fn<undefined, [Values]>();

    render(
      <FormProvider
        ref={ref}
        values={{}}
        validate={validate}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    act(() => {
      ref.current?.focusField('foo');
      ref.current?.blurField('foo');
    });

    // Expect validate to be called only once.
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('should not call validate with when the values prop changes', () => {
    const validate = jest.fn<undefined, [{foo: any}]>();

    const {rerender} = render(
      <FormProvider
        values={{foo: 'bar'}}
        validate={validate}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    rerender(
      <FormProvider
        values={{foo: 'pending'}}
        validate={validate}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    // Expect validate to be called only once.
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('should call warn with initial values on first mount', () => {
    const values = {foo: 'bar'};
    const warn = jest.fn<undefined, [{foo: any}]>();

    render(
      <FormProvider
        values={values}
        warn={warn}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    // Expect warn to be called only once per update.
    expect(warn).toHaveBeenCalledTimes(1);

    // Expect warn to have been called with the correct arguments.
    expect(warn).toHaveBeenLastCalledWith(values);
  });

  it('should call validate with current values when warn is updated', () => {
    const values = {foo: 'bar'};

    const {rerender} = render(
      <FormProvider
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    const warn = jest.fn<undefined, [{foo: any}]>();

    rerender(
      <FormProvider
        values={values}
        warn={warn}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    // Expect incoming warn to be called immediately.
    expect(warn).toHaveBeenCalledTimes(1);

    // Expect warn to have been called with the correct arguments.
    expect(warn).toHaveBeenLastCalledWith(values);
  });

  it('should call warn with updated values when value state changes', () => {
    const values = {foo: 'bar'};

    const ref = React.createRef<FormState<typeof values, void, any, any>>();

    const warn = jest.fn<undefined, [{foo: any}]>();

    render(
      <FormProvider
        ref={ref}
        values={values}
        warn={warn}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    expect(warn).toHaveBeenLastCalledWith(values);

    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated');
    });

    // Expect warn to be called only once per state update.
    expect(warn).toHaveBeenCalledTimes(2);

    expect(warn).toHaveBeenLastCalledWith(
      expect.objectContaining({foo: 'updated'}),
    );
  });

  it('should not call warn with when other state changes', () => {
    const ref =
      React.createRef<FormState<Record<string, unknown>, void, any, any>>();

    const warn = jest.fn<undefined, [Record<string, unknown>]>();

    render(
      <FormProvider
        ref={ref}
        values={{}}
        warn={warn}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    act(() => {
      ref.current?.focusField('foo');
      ref.current?.blurField('foo');
    });

    // Expect warn to be called only once.
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('should not call warn with when the values prop changes', () => {
    const values = {foo: 'bar'};

    const warn = jest.fn<undefined, [{foo: any}]>();

    const {rerender} = render(
      <FormProvider
        values={values}
        warn={warn}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    rerender(
      <FormProvider
        values={{foo: 'pending'}}
        warn={warn}
        onSubmit={() => ({ok: true, data: undefined})}
      />,
    );

    // Expect warn to be called only once.
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmit with current values', async () => {
    const values = {};
    const ref = React.createRef<FormState<typeof values, void, any, any>>();

    const onSubmit = jest.fn(() => ({ok: true, data: undefined} as const));

    render(<FormProvider ref={ref} values={values} onSubmit={onSubmit} />);

    await act(async () => {
      await ref.current?.submit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenLastCalledWith(values);
  });

  it('should call correct handlers handler props on successful submit', async () => {
    const submitResult = {};

    const values = {};
    const ref =
      React.createRef<
        FormState<typeof values, typeof submitResult, any, any>
      >();

    const onSubmitError = jest.fn();

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => Promise.resolve({ok: true, data: submitResult})}
      />,
    );

    await act(async () => {
      await ref.current?.submit();
    });

    expect(onSubmitError).toHaveBeenCalledTimes(0);
  });

  it('should complete submit sequence if the component is unmounted', async () => {
    const values = {};
    const ref = React.createRef<FormState<typeof values, void, any, any>>();

    const onSubmit = jest.fn(() => ({ok: true, data: undefined} as const));

    await act(async () => {
      const {unmount} = render(
        <FormProvider ref={ref} values={values} onSubmit={onSubmit} />,
      );

      const current = ref.current;

      unmount();

      await current?.submit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
