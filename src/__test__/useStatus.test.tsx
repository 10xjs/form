import * as React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '@testing-library/react';

import Esimorp from './Esimorp';

import * as Form from '../';

type ModuleType = Form.TypedModule<
  any,
  unknown,
  unknown,
  string | void,
  string | void
>;
type Status = Form.StatusOf<ModuleType>;
type Interface = Form.InterfaceOf<ModuleType>;

const TypedForm = Form as ModuleType;

const statusHandler = (): [
  jest.Mock<void, [Status]>,
  React.NamedExoticComponent,
] => {
  const handleStatus = jest.fn<void, [Status]>();

  const WithStatus = React.memo((): null => {
    handleStatus(TypedForm.useStatus());
    return null;
  });

  WithStatus.displayName = 'WithStatus';

  return [handleStatus, WithStatus];
};

describe('useStatus hook', () => {
  it('should update once with the correct result on first render', () => {
    const [handleStatus, WithStatus] = statusHandler();

    render(
      <TypedForm.Form values={{}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hasErrors: false,
        hasSubmitErrors: false,
        hasWarnings: false,
        submitFailed: false,
        submitSucceeded: false,
        submitting: false,
      }),
    );
  });

  it('should return the correct hasError and hasWarning values', () => {
    const [handleStatus, WithStatus] = statusHandler();

    render(
      <TypedForm.Form
        values={{}}
        validate={() => 'error'}
        warn={() => 'warning'}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    // Expect validate and warn to affect the hasErrors and hasWarnings props.
    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hasErrors: true,
        hasSubmitErrors: false,
        hasWarnings: true,
        submitFailed: false,
        submitSucceeded: false,
        submitting: false,
      }),
    );
  });

  it('should not be affected by an updated validate prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <TypedForm.Form values={{}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form values={{}} validate={() => {}}>
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should return updated hasErrors value with an updated validate prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <TypedForm.Form values={{}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form values={{}} validate={() => 'errors'}>
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hasErrors: true,
      }),
    );
  });

  it('should not be affected by an updated warn prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <TypedForm.Form values={{}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form values={{}} warn={() => {}}>
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should return updated hasErrors value with an updated warn prop', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <TypedForm.Form values={{}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form values={{}} warn={() => 'warnings'}>
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hasWarnings: true,
      }),
    );
  });

  it('should not be affected by other prop changes', () => {
    const [handleStatus, WithStatus] = statusHandler();

    const {container} = render(
      <TypedForm.Form values={{}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form
        values={{foo: 'bar'}}
        validate={() => {}}
        warn={() => {}}
        onSubmit={() => {}}
        onSubmitFail={() => {}}
      >
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    render(
      <TypedForm.Form
        values={{}}
        validate={() => {}}
        warn={() => {}}
        onSubmit={() => {}}
        onSubmitFail={() => {}}
      >
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should not be affected by change events', () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    render(
      <TypedForm.Form ref={ref} values={{foo: 'bar'}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    act(() => {
      (ref.current as Interface).setValue(['foo'], 'updated');
      (ref.current as Interface).setValue(['foo'], 'updated again');
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should return updated touched, focused, and visited for focus and blur events', () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    render(
      <TypedForm.Form ref={ref} values={{foo: 'bar'}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    expect(handleStatus).toHaveBeenCalledTimes(1);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        touched: false,
        focused: false,
        visited: false,
      }),
    );

    act(() => {
      (ref.current as Interface).focus(['foo']);
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        touched: false,
        focused: true,
        visited: true,
      }),
    );

    act(() => {
      (ref.current as Interface).blur(['foo']);
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        touched: true,
        focused: false,
        visited: true,
      }),
    );
  });

  it('should not be affected when accepting a pending value', () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const {container} = render(
      <TypedForm.Form ref={ref} values={{foo: 'bar'}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form ref={ref} values={{foo: 'pending'}}>
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    act(() => {
      (ref.current as Interface).acceptPendingValue(['foo']);
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should not be affected when rejecting a pending value', () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const {container} = render(
      <TypedForm.Form ref={ref} values={{foo: 'bar'}}>
        <WithStatus />
      </TypedForm.Form>,
    );

    render(
      <TypedForm.Form ref={ref} values={{foo: 'pending'}}>
        <WithStatus />
      </TypedForm.Form>,
      {container},
    );

    act(() => {
      (ref.current as Interface).rejectPendingValue(['foo']);
    });

    expect(handleStatus).toHaveBeenCalledTimes(1);
  });

  it('should update correctly during a successful submit', async () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const submit = new Esimorp();
    const success = new Esimorp();

    const submitResult = {};

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => {
          return submit.resolve(submitResult);
        }}
        onSubmitSuccess={() => {
          return success.resolve();
        }}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    await act(async () => {
      (ref.current as Interface).submit();
      await submit;

      expect(handleStatus).toHaveBeenCalledTimes(2);

      expect(handleStatus).toHaveBeenLastCalledWith(
        expect.objectContaining({
          submitting: true,
        }),
      );

      await success;
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: false,
        submitSucceeded: true,
        hasSubmitErrors: false,
        result: submitResult,
      }),
    );
  });

  it('should update correctly during a submit with which fails local validation', async () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const fail = new Esimorp();

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        validate={() => 'errors'}
        onSubmitFail={() => {
          fail.resolve();
        }}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    await act(async () => {
      (ref.current as Interface).submit();

      await fail;
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: false,
        submitFailed: true,
        hasSubmitErrors: true,
        error: expect.any(Form.SubmitValidationError),
      }),
    );
  });

  it('should update correctly during a submit with which fails remote validation', async () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const fail = new Esimorp();

    const validationError = new Form.SubmitValidationError('errors');

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => {
          return Promise.reject(validationError);
        }}
        onSubmitFail={() => {
          fail.resolve();
        }}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    act(() => {
      (ref.current as Interface).submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: true,
      }),
    );

    await act(async () => {
      await fail;
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: false,
        submitFailed: true,
        hasSubmitErrors: true,
        error: validationError,
      }),
    );
  });

  it('should update correctly during a submit with which fails remote validation with empty error', async () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const fail = new Esimorp();

    const validationError = new Form.SubmitValidationError({});

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.reject(validationError)}
        onSubmitFail={() => {
          fail.resolve();
        }}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    act(() => {
      (ref.current as Interface).submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: true,
      }),
    );

    await act(async () => {
      await fail;
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: false,
        submitFailed: true,
        hasSubmitErrors: false,
        error: validationError,
      }),
    );
  });

  it('should update correctly during a submit with which fails with a concurrency error', async () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const submit = new Esimorp();
    const success = new Esimorp();
    const fail = new Esimorp();

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => {
          return submit.resolve();
        }}
        onSubmitSuccess={() => {
          return success.resolve();
        }}
        onSubmitFail={() => {
          return fail.resolve();
        }}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    act(() => {
      (ref.current as Interface).submit();
      (ref.current as Interface).submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: true,
        submitFailed: false,
      }),
    );

    await act(async () => {
      await fail;
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: false,
        submitFailed: false,
        submitSucceeded: true,
      }),
    );
  });

  it('should update correctly during a submit with which fails with an unexpected error', async () => {
    const [handleStatus, WithStatus] = statusHandler();
    const ref = React.createRef<Interface>();

    const fail = new Esimorp();

    const unexpectedError = new Error();

    render(
      <TypedForm.Form
        ref={ref}
        values={{}}
        onSubmit={() => Promise.reject(unexpectedError)}
        onSubmitFail={() => {
          fail.resolve();
        }}
      >
        <WithStatus />
      </TypedForm.Form>,
    );

    act(() => {
      (ref.current as Interface).submit();
    });

    expect(handleStatus).toHaveBeenCalledTimes(2);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: true,
      }),
    );

    await act(async () => {
      await fail;
    });

    expect(handleStatus).toHaveBeenCalledTimes(3);

    expect(handleStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submitting: false,
        submitFailed: true,
        hasSubmitErrors: false,
        error: unexpectedError,
      }),
    );
  });
});
