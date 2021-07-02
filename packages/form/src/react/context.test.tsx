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

  // it('should prevent default behavior of event passed to submit', async () => {
  //   const values = {};
  //   const ref = React.createRef<FormState<typeof values, void, any, any>>();

  //   const event = {preventDefault: jest.fn()};

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={{}}
  //       onSubmit={() => ({ok: true, data: undefined})}
  //     />,
  //   );

  //   await act(async () => {
  //     await ref.current?.submit(event as any);
  //   });

  //   expect(event.preventDefault).toHaveBeenCalledTimes(1);
  // });

  // it('should call correct handlers on attempted submit with local validation errors', async () => {
  //   const values = {};

  //   const ref = React.createRef<FormState<typeof values, void, any, any>>();

  //   const fail = new Subject();

  //   const onSubmitEnded = jest.fn();
  //   const onSubmitError = jest.fn(() => {
  //     fail.complete();
  //   });

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={values}
  //       validate={() => 'errors'}
  //       onSubmit={() => ({ok: true, data: undefined})}
  //     />,
  //   );

  //   await act(async () => {
  //     await ref.current?.submit();

  //     await fail.toPromise();
  //   });

  //   expect(onSubmitEnded).toHaveBeenCalledTimes(0);
  //   expect(onSubmitError).toHaveBeenCalledTimes(1);

  //   expect(onSubmitError).toHaveBeenLastCalledWith(
  //     expect.any(SubmitValidationError),
  //   );
  // });

  // it('should call correct handlers on attempted submit with remote validation errors', async () => {
  //   const values = {};
  //   const ref = React.createRef<FormState<typeof values, void, any, any>>();

  //   const validationError = new SubmitValidationError('errors');

  //   const fail = new Subject<SubmitValidationError>();

  //   const onSubmitEnded = jest.fn();
  //   const onSubmitError = jest.fn(() => {
  //     fail.complete();
  //   });

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={values}
  //       onSubmit={() => Promise.reject(validationError)}
  //       onSubmitError={onSubmitError}
  //     />,
  //   );

  //   await act(async () => {
  //     await ref.current?.submit();

  //     await fail.toPromise();
  //   });

  //   expect(onSubmitEnded).toHaveBeenCalledTimes(0);
  //   expect(onSubmitError).toHaveBeenCalledTimes(1);

  //   expect(onSubmitError).toHaveBeenLastCalledWith(validationError);
  // });

  // it('should call correct handlers on attempted submit with empty remote validation error', async () => {
  //   const values = {};
  //   const ref = React.createRef<FormState<typeof values, void, any, any>>();

  //   const validationError = new SubmitValidationError({});

  //   const fail = new Subject<SubmitValidationError>();

  //   const onSubmitEnded = jest.fn();
  //   const onSubmitError = jest.fn(() => {
  //     fail.complete();
  //   });

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={values}
  //       onSubmit={() => Promise.reject(validationError)}
  //       onSubmitError={onSubmitError}
  //     />,
  //   );

  //   await act(async () => {
  //     ref.current?.submit();

  //     await fail.toPromise();
  //   });

  //   expect(onSubmitEnded).toHaveBeenCalledTimes(0);
  //   expect(onSubmitError).toHaveBeenCalledTimes(1);

  //   expect(onSubmitError).toHaveBeenLastCalledWith(validationError);
  // });

  // it('should call correct handlers on attempted submit with unexpected error', async () => {
  //   const values = {};
  //   const ref = React.createRef<FormState<typeof values, void, any, any>>();

  //   const unexpectedError = new Error();

  //   const fail = new Subject<Error>();

  //   const onSubmitEnded = jest.fn();
  //   const onSubmitError = jest.fn(() => {
  //     fail.complete();
  //   });

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={values}
  //       onSubmit={() => {
  //         throw unexpectedError;
  //       }}
  //       onSubmitError={onSubmitError}
  //     />,
  //   );

  //   act(() => {
  //     ref.current?.submit();
  //   });

  //   await fail.toPromise();

  //   expect(onSubmitEnded).toHaveBeenCalledTimes(0);
  //   expect(onSubmitError).toHaveBeenCalledTimes(1);

  //   expect(onSubmitError).toHaveBeenLastCalledWith(unexpectedError);
  // });

  // it('should call correct handlers on attempted submit with unexpected rejection', async () => {
  //   const values = {};
  //   const ref = React.createRef<
  //     FormState<typeof values, void, any, any, any>
  //   >();

  //   const unexpectedError = new Error();

  //   const fail = new Subject<Error>();

  //   const onSubmitEnded = jest.fn();
  //   const onSubmitError = jest.fn(() => {
  //     fail.complete();
  //   });

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={values}
  //       onSubmit={() => Promise.reject(unexpectedError)}
  //       onSubmitError={onSubmitError}
  //     />,
  //   );

  //   await act(async () => {
  //     ref.current?.submit();

  //     await fail.toPromise();
  //   });

  //   expect(onSubmitEnded).toHaveBeenCalledTimes(0);
  //   expect(onSubmitError).toHaveBeenCalledTimes(1);

  //   expect(onSubmitError).toHaveBeenLastCalledWith(unexpectedError);
  // });

  // it('should call correct handlers on attempted submit if a submit is in progress', async () => {
  //   const values = {};
  //   const ref = React.createRef<FormState<typeof values, void, any, any>>();

  //   const fail = new Subject<Error>();

  //   const onSubmitError = jest.fn(() => {
  //     fail.complete();
  //   });

  //   render(
  //     <FormProvider
  //       ref={ref}
  //       values={values}
  //       onSubmit={() => Promise.resolve()}
  //       onSubmitError={onSubmitError}
  //     />,
  //   );

  //   act(() => {
  //     ref.current?.submit();
  //     ref.current?.submit();
  //   });

  //   await act(async () => {
  //     await fail.toPromise();
  //   });

  //   expect(onSubmitError).toHaveBeenCalledTimes(1);

  //   expect(onSubmitError).toHaveBeenLastCalledWith(
  //     expect.any(SubmitConcurrencyError),
  //   );
  // });
});
