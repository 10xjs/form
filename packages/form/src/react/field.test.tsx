import * as React from 'react';
import {renderHook, act} from '@testing-library/react-hooks/pure';

import {FormState} from '../core/formState';

import {FormProvider} from './context';
import {useField} from './field';
import {useFormState} from './formState';

const initialFieldValues = {
  detached: false,
  dirty: false,
  error: undefined,
  focused: false,
  initialValue: 'bar',
  pendingValue: 'bar',
  touched: false,
  value: 'bar',
  visited: false,
  warning: undefined,
};

describe('useField hook', () => {
  it('should update once with the correct result on first render', () => {
    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        values={{foo: 'bar'}}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    expect(result.all).toHaveLength(1);

    expect(result.current[0]).toEqual(initialFieldValues);
  });

  it('should support receiving form as a prop', () => {
    const {result} = renderHook(() =>
      useField(
        ['foo'],
        useFormState(
          {foo: 'bar'},
          {
            onSubmit() {
              return {ok: true, data: undefined};
            },
          },
        ),
      ),
    );

    expect(result.all).toHaveLength(1);
    expect(result.current[0]).toEqual(initialFieldValues);
  });

  it('should respond to value changes', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.setFieldValue(['foo'], 'updated');
    });

    expect(result.all).toHaveLength(2);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      dirty: true,
      pendingValue: 'updated',
      value: 'updated',
    });
  });

  it('should not process unnecessary updates', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

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
    expect(result.all).toHaveLength(5);
  });

  it('should not be affected by value changes for other fields', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(result.all).toHaveLength(1);
  });

  it('should respond to error changes', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
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
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(result.all).toHaveLength(2);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      error: 'error',
    });
  });

  it('should not be affected by error changes for other fields', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
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
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(result.all).toHaveLength(1);
  });

  it('should respond to warning changes', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
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
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(result.all).toHaveLength(2);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      ...initialFieldValues,
      warning: 'warning',
    });
  });

  it('should not be affected by warning changes for other fields', () => {
    const values = {foo: 'bar', bar: ''};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
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
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.setFieldValue(['bar'], 'updated');
    });

    expect(result.all).toHaveLength(1);
  });

  it('should respond correctly to pending values', () => {
    const {result, rerender} = renderHook(
      ({values}: {values: {foo: string}}) =>
        useField(
          ['foo'],
          useFormState(values, {
            onSubmit() {
              return {ok: true, data: undefined};
            },
          }),
        ),
      {initialProps: {values: {foo: 'bar'}}},
    );

    rerender({values: {foo: 'pending'}});

    expect(result.all).toHaveLength(3);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      detached: true,
      dirty: true,
      initialValue: 'pending',
      pendingValue: 'pending',
    });
  });

  it('should not be affected by pending values for other fields', () => {
    const {result, rerender} = renderHook(
      ({values}: {values: {foo: string; bar?: string}}) =>
        useField(
          ['foo'],
          useFormState(values, {
            onSubmit() {
              return {ok: true, data: undefined};
            },
          }),
        ),
      {initialProps: {values: {foo: 'bar'}}},
    );

    rerender({values: {foo: 'bar', bar: 'pending'}});

    expect(result.all).toHaveLength(2);
  });

  it('should correctly respond to an accepted pending value', () => {
    const {result, rerender} = renderHook(
      ({values}: {values: {foo: string}}) =>
        useField(
          ['foo'],
          useFormState(values, {
            onSubmit() {
              return {ok: true, data: undefined};
            },
          }),
        ),
      {initialProps: {values: {foo: 'bar'}}},
    );

    rerender({values: {foo: 'pending'}});

    expect(result.all).toHaveLength(3);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      initialValue: 'pending',
      pendingValue: 'pending',
      dirty: true,
      detached: true,
    });

    act(() => {
      result.current[1].acceptPendingValue();
    });

    expect(result.all).toHaveLength(4);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      initialValue: 'pending',
      pendingValue: 'pending',
      value: 'pending',
    });
  });

  it('should correctly respond to a rejected pending value', () => {
    const {result, rerender} = renderHook(
      ({values}: {values: {foo: string}}) =>
        useField(
          ['foo'],
          useFormState(values, {
            onSubmit() {
              return {ok: true, data: undefined};
            },
          }),
        ),
      {initialProps: {values: {foo: 'bar'}}},
    );

    rerender({values: {foo: 'pending'}});

    expect(result.all).toHaveLength(3);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      initialValue: 'pending',
      pendingValue: 'pending',
      dirty: true,
      detached: true,
    });

    act(() => {
      result.current[1].rejectPendingValue();
    });

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      dirty: true,
      initialValue: 'pending',
    });
  });

  it('should respond correctly to focus changes', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.focusField(['foo']);
    });

    expect(result.all).toHaveLength(2);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      focused: true,
      visited: true,
    });

    act(() => {
      ref.current?.blurField(['foo']);
    });

    expect(result.all).toHaveLength(3);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      touched: true,
      visited: true,
    });
  });

  it('should respond correctly to implicit effects of blur events', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.blurField(['foo']);
    });

    expect(result.all).toHaveLength(2);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      touched: true,
      visited: true,
    });
  });

  it('should respond correctly to implicit effects of focus events for other fields', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.focusField(['foo']);
    });

    expect(result.all).toHaveLength(2);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      focused: true,
      visited: true,
    });

    act(() => {
      ref.current?.focusField(['bar']);
    });

    expect(result.all).toHaveLength(3);

    expect(result.current[0]).toEqual({
      ...initialFieldValues,
      touched: true,
      visited: true,
    });
  });

  it('should not be affected by focus events for other fields', () => {
    const values = {foo: 'bar'};
    const ref = React.createRef<FormState<typeof values, any, any, any>>();

    const wrapper = ({children}: React.PropsWithChildren<{}>) => (
      <FormProvider
        ref={ref}
        values={values}
        onSubmit={() => ({ok: true, data: undefined})}
      >
        {children}
      </FormProvider>
    );

    const {result} = renderHook(() => useField(['foo']), {wrapper});

    act(() => {
      ref.current?.focusField(['bar']);
    });
    act(() => {
      ref.current?.blurField(['bar']);
    });

    expect(result.all).toHaveLength(1);
  });
});
