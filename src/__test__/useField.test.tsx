import * as React from 'react';
import {act} from 'react-dom/test-utils';
import {render} from '@testing-library/react';

import * as Form from '../';

type ModuleType = Form.TypedModule<any, void>;
type FormInterface = Form.InterfaceOf<ModuleType>;

const fieldHandler = (
  path: (string | number)[],
  form?: any,
): [
  jest.Mock<void, [Form.FieldInterface<string, string, string>]>,
  React.NamedExoticComponent,
] => {
  const handleField = jest.fn<
    void,
    [Form.FieldInterface<string, string, string>]
  >();

  const WithField = React.memo((): null => {
    handleField(Form.useField(path, {form}));
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
      <Form.Form values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    expect(handleField).toHaveBeenCalledTimes(1);

    expect(handleField).toHaveBeenLastCalledWith(
      expect.objectContaining(initialFieldValues),
    );
  });

  it('should respond to value changes', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated');
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 1');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 1');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 2');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 2');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 3');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 3');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 4');
    });
    act(() => {
      (ref.current as FormInterface).setValue(['foo'], 'updated 4');
    });

    // Expect one initial render followed by 4 value updates. Idempotent value
    // changes should not trigger updates.
    expect(handleField).toHaveBeenCalledTimes(5);
  });

  it('should not be affected by value changes for other fields', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond to error changes', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form
        ref={ref}
        values={{foo: 'bar'}}
        validate={(values: any) => {
          if (values.bar) {
            return {foo: 'error'};
          }
          return {};
        }}
      >
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['bar'], 'updated');
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form
        ref={ref}
        values={{foo: 'bar'}}
        validate={(values: any) => {
          if (values.bar) {
            return {bar: 'error'};
          }
          return {};
        }}
      >
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond to warning changes', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form
        ref={ref}
        values={{foo: 'bar'}}
        warn={(values: any) => {
          if (values.bar) {
            return {foo: 'warning'};
          }
          return {};
        }}
      >
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['bar'], 'updated');
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form
        ref={ref}
        values={{foo: 'bar'}}
        warn={(values: any) => {
          if (values.bar) {
            return {bar: 'warning'};
          }
          return {};
        }}
      >
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).setValue(['bar'], 'updated');
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond correctly to pending values', () => {
    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <Form.Form values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    rerender(
      <Form.Form values={{foo: 'pending'}}>
        <WithField />
      </Form.Form>,
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
      <Form.Form values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    rerender(
      <Form.Form values={{foo: 'bar', bar: 'pending'}}>
        <WithField />
      </Form.Form>,
    );

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should correctly respond to an accepted pending value', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    rerender(
      <Form.Form ref={ref} values={{foo: 'pending'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).acceptPendingValue(['foo']);
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <Form.Form ref={ref} values={{foo: 'bar', bar: 'foo'}}>
        <WithField />
      </Form.Form>,
    );

    rerender(
      <Form.Form ref={ref} values={{foo: 'bar', bar: 'pending'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).acceptPendingValue(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should correctly respond to a rejected pending value', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    rerender(
      <Form.Form ref={ref} values={{foo: 'pending'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).rejectPendingValue(['foo']);
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    const {rerender} = render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    rerender(
      <Form.Form ref={ref} values={{foo: 'bar', bar: 'pending'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).rejectPendingValue(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });

  it('should respond correctly to focus changes', () => {
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).focus(['foo']);
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
      (ref.current as FormInterface).blur(['foo']);
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).blur(['foo']);
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).focus(['foo']);
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
      (ref.current as FormInterface).focus(['bar']);
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
    const ref = React.createRef<FormInterface>();

    const [handleField, WithField] = fieldHandler(['foo']);

    render(
      <Form.Form ref={ref} values={{foo: 'bar'}}>
        <WithField />
      </Form.Form>,
    );

    act(() => {
      (ref.current as FormInterface).focus(['bar']);
    });
    act(() => {
      (ref.current as FormInterface).blur(['bar']);
    });

    expect(handleField).toHaveBeenCalledTimes(1);
  });
});
