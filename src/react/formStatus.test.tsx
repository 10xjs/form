import * as React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '@testing-library/react';

import {FormState, SubmitResult} from '../core/formState';
import {FormStatusData} from '../core/formStatus';
import {SubmitValidationError} from '../core/errors';

import {FormProvider} from './context';
import {useFormStatus} from './formStatus';
import {useFormState} from './formState';

const statusHandler = (): [
  jest.Mock<void, [FormStatusData<any>]>,
  React.NamedExoticComponent,
] => {
  const handleStatus = jest.fn<undefined, [FormStatusData<any>]>();

  const WithStatus = React.memo((): null => {
    handleStatus(useFormStatus<any>()[0]);
    return null;
  });

  WithStatus.displayName = 'WithStatus';

  return [handleStatus, WithStatus];
};

const initialStatus = {
  error: undefined,
  hasErrors: false,
  hasSubmitErrors: false,
  hasWarnings: false,
  result: undefined,
  submitFailed: false,
  submitSucceeded: false,
  submitting: false,
};

describe('useFormStatus hook', () => {
  it('should update once with the correct result on first render', () => {
    const [handleStatus, WithStatus] = statusHandler();

    render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <WithStatus />
      </FormProvider>,
    );

    expect(handleStatus).toHaveBeenLastCalledWith(initialStatus);

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should support receiving form as a prop', () => {
    const handleStatus = jest.fn<undefined, [FormStatusData<any>]>();

    const Root = () => {
      const form = useFormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );
      handleStatus(useFormStatus(form)[0]);
      return null;
    };

    render(<Root />);

    expect(handleStatus).toHaveBeenLastCalledWith(initialStatus);

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should return the correct hasError and hasWarning values', () => {
    const [handleStatus, WithStatus] = statusHandler();

    render(
      <FormProvider
        values={{}}
        validate={() => 'error'}
        warn={() => 'warning'}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
    );

    // Expect validate and warn to affect the hasErrors and hasWarnings props.
    expect(handleStatus).toHaveBeenLastCalledWith({
      ...initialStatus,
      hasErrors: true,
      hasWarnings: true,
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should not be affected by an updated validate prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        values={{}}
        validate={() => {}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should return updated hasErrors value with an updated validate prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        values={{}}
        validate={() => 'errors'}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith({
      ...initialStatus,
      hasErrors: true,
    });
  });

  it('should not be affected by an updated warn prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        values={{}}
        warn={() => {}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should return updated hasErrors value with an updated warn prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        values={{}}
        warn={() => 'warnings'}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith({
      ...initialStatus,
      hasWarnings: true,
    });
  });

  it('should not be affected by other prop changes', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <FormProvider values={{}} onSubmit={() => ({ok: true, data: undefined})}>
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        values={{foo: 'bar'}}
        validate={() => {}}
        warn={() => {}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    render(
      <FormProvider
        values={{}}
        validate={() => {}}
        warn={() => {}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should not be affected by change events', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated');
      ref.current?.setFieldValue(['foo'], 'updated again');
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should not be affected when accepting a pending value', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const {container} = render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        ref={ref}
        values={{foo: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    act(() => {
      ref.current?.acceptPendingFieldValue(['foo']);
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should not be affected when rejecting a pending value', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const {container} = render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
    );

    render(
      <FormProvider
        ref={ref}
        values={{foo: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
      {container},
    );

    act(() => {
      ref.current?.rejectPendingFieldValue(['foo']);
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should update correctly during a successful submit', async () => {
    const [handleStatus, WithStatus] = statusHandler();

    const submitResult = {};

    const values = {};
    const ref = React.createRef<
      FormState<typeof values, typeof submitResult, any, any>
    >();

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => {
          return new Promise<SubmitResult<typeof submitResult>>((resolve) =>
            setTimeout(() => resolve({ok: true, data: submitResult})),
          );
        }}
      >
        <WithStatus />
      </FormProvider>,
    );

    await act(async () => {
      await ref.current?.submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenNthCalledWith(1, initialStatus);

    expect(handleStatus).toHaveBeenNthCalledWith(2, {
      ...initialStatus,
      submitSucceeded: true,
      result: submitResult,
    });
  });

  it('should update correctly during a submit with which fails local validation', async () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    render(
      <FormProvider
        ref={ref}
        values={values}
        validate={() => 'errors'}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithStatus />
      </FormProvider>,
    );

    await act(async () => {
      await ref.current?.submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith({
      ...initialStatus,
      hasErrors: true,
      submitFailed: true,
      hasSubmitErrors: true,
      error: expect.any(SubmitValidationError),
    });
  });

  it('should update correctly during a submit with which fails remote validation', async () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const validationError = new SubmitValidationError('errors');

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => {
          return {ok: false, error: validationError};
        }}
      >
        <WithStatus />
      </FormProvider>,
    );

    await act(async () => {
      await ref.current?.submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenNthCalledWith(1, initialStatus);

    expect(handleStatus).toHaveBeenNthCalledWith(2, {
      ...initialStatus,
      submitFailed: true,
      hasSubmitErrors: true,
      error: validationError,
    });
  });

  it('should update correctly during a submit with which fails remote validation with empty error', async () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const validationError = new SubmitValidationError({});

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => Promise.resolve({ok: false, error: validationError})}
      >
        <WithStatus />
      </FormProvider>,
    );

    await act(async () => {
      await ref.current?.submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenNthCalledWith(1, initialStatus);

    expect(handleStatus).toHaveBeenNthCalledWith(2, {
      ...initialStatus,
      submitFailed: true,
      error: validationError,
    });
  });

  it('should update correctly during a submit with which fails with a concurrency error', async () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => {
          return Promise.resolve({ok: true, data: null});
        }}
      >
        <WithStatus />
      </FormProvider>,
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);

    expect(handleStatus).toHaveBeenNthCalledWith(1, initialStatus);

    await act(async () => {
      const first = ref.current?.submit();
      await ref.current?.submit();
      await first;
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenNthCalledWith(1, initialStatus);

    expect(handleStatus).toHaveBeenNthCalledWith(2, {
      ...initialStatus,
      submitSucceeded: true,
    });
  });

  it('should update correctly during a submit with which fails with an unexpected error', async () => {
    const [handleStatus, WithStatus] = statusHandler();

    const values = {};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const unexpectedError = new Error();

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => Promise.reject(unexpectedError)}
      >
        <WithStatus />
      </FormProvider>,
    );

    await act(async () => {
      await expect(ref.current?.submit()).rejects.toBe(unexpectedError);
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenNthCalledWith(1, initialStatus);

    expect(handleStatus).toHaveBeenLastCalledWith({
      ...initialStatus,
      submitting: false,
      submitFailed: true,
      hasSubmitErrors: false,
    });
  });
});
