import * as React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '@testing-library/react';

import {FormState} from '../core/formState';

import {FormProvider} from './context';
import {useField} from './field';
import {FieldData} from '../core/field';
import {useFormState} from './formState';

const fieldHandler = (
  path: Array<string | number>,
): [jest.Mock<void, [FieldData<string>]>, React.NamedExoticComponent] => {
  const handleField = jest.fn<undefined, [FieldData<string>]>();

  const WithField = React.memo((): null => {
    handleField(useField<string>(path)[0]);
    return null;
  });

  WithField.displayName = 'WithField';

  return [handleField, WithField];
};

const initialFieldValues = {
  detached: false,
  dirty: false,
  error: null,
  focused: false,
  initialValue: 'bar',
  pendingValue: 'bar',
  touched: false,
  value: 'bar',
  visited: false,
  warning: null,
};

describe('useField hook', () => {
  it('should update once with the correct result on first render', () => {
    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        values={{foo: 'bar'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    expect(handleField).toHaveBeenCalledTimes(1);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining(initialFieldValues),
    );
  });

  it('should support receiving form as a prop', () => {
    const handleField = jest.fn<undefined, [FieldData<string>]>();

    const Root = () => {
      const form = useFormState(
        {foo: 'bar'},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );
      handleField(useField<string>('foo', form)[0]);
      return null;
    };

    render(<Root />);

    expect(handleField).toHaveBeenCalledTimes(1);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining(initialFieldValues),
    );
  });

  it('should respond to value changes', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        dirty: true,
        pendingValue: 'updated',
        value: 'updated',
      }),
    );
  });

  it('should not process unnecessary updates', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 1');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 1');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 2');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 2');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 3');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 3');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 4');
    });
    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated 4');
    });

    // Expect one initial render followed by 4 value updates. Idempotent value
    // changes should not trigger updates.
    expect(handleField).toHaveBeenCalledTimes(5);
  });

  it('should not be affected by value changes for other fields', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond to error changes', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        validate={(values) => {
          if (values.bar !== '') {
            return {foo: 'error'};
          }
          return {};
        }}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        error: 'error',
      }),
    );
  });

  it('should not be affected by error changes for other fields', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        validate={(values) => {
          if (values.bar !== '') {
            return {bar: 'error'};
          }
          return {};
        }}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond to warning changes', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        warn={(values) => {
          if (values.bar !== '') {
            return {foo: 'warning'};
          }
          return {};
        }}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        warning: 'warning',
      }),
    );
  });

  it('should not be affected by warning changes for other fields', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        warn={(values) => {
          if (values.bar !== '') {
            return {bar: 'warning'};
          }
          return {};
        }}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond correctly to pending values', () => {
    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <FormProvider
        values={{foo: 'bar'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    rerender(
      <FormProvider
        values={{foo: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        detached: true,
        dirty: true,
        initialValue: 'pending',
        pendingValue: 'pending',
      }),
    );
  });

  it('should not be affected by pending values for other fields', () => {
    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <FormProvider
        values={{foo: 'bar'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    rerender(
      <FormProvider
        values={{foo: 'bar', bar: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should correctly respond to an accepted pending value', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    rerender(
      <FormProvider
        ref={ref}
        values={{foo: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        initialValue: 'pending',
        pendingValue: 'pending',
        dirty: true,
        detached: true,
      }),
    );

    act(() => {
      ref.current?.acceptPendingFieldValue(['foo']);
    });

    expect(handleField).toHaveBeenCalledTimes(3);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        initialValue: 'pending',
        pendingValue: 'pending',
        value: 'pending',
      }),
    );
  });

  it('should not be affected by accepted pending values for other fields', () => {
    const values = {foo: 'bar', bar: 'foo'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    rerender(
      <FormProvider
        ref={ref}
        values={{...values, bar: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.acceptPendingFieldValue(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should correctly respond to a rejected pending value', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    rerender(
      <FormProvider
        ref={ref}
        values={{foo: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.rejectPendingFieldValue(['foo']);
    });

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        dirty: true,
        initialValue: 'pending',
      }),
    );
  });

  it('should not be affected by rejected pending values for other fields', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    rerender(
      <FormProvider
        ref={ref}
        values={{...values, bar: 'pending'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.rejectPendingFieldValue(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond correctly to focus changes', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.focusField(['foo']);
    });

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        focused: true,
        visited: true,
      }),
    );

    act(() => {
      ref.current?.blurField(['foo']);
    });

    expect(handleField).toHaveBeenCalledTimes(3);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        touched: true,
        visited: true,
      }),
    );
  });

  it('should respond correctly to implicit effects of blur events', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.blurField(['foo']);
    });

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        touched: true,
        visited: true,
      }),
    );
  });

  it('should respond correctly to implicit effects of focus events for other fields', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.focusField(['foo']);
    });

    expect(handleField).toHaveBeenCalledTimes(2);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        focused: true,
        visited: true,
      }),
    );

    act(() => {
      ref.current?.focusField(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(3);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...initialFieldValues,
        touched: true,
        visited: true,
      }),
    );
  });

  it('should not be affected by focus events for other fields', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        <WithField />
      </FormProvider>,
    );

    act(() => {
      ref.current?.focusField(['bar']);
    });
    act(() => {
      ref.current?.blurField(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });
});
