import {FormState} from './formState';

describe('FormStateManager', () => {
  describe('constructor', () => {
    it('should set initial state', () => {
      const values = {foo: 'bar'};

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
      });

      const state = form.getState();

      expect(state.values).toBe(values);
      expect(state.initialValues).toBe(values);
      expect(state.pendingValues).toBe(values);
      expect(state.errors).toBeUndefined();
      expect(state.warnings).toBeUndefined();
      expect(state.submitErrors).toBeUndefined();
      expect(state.focusedPath).toBeUndefined();
      expect(state.touchedMap).toEqual({});
      expect(state.visitedMap).toEqual({});
      expect(state.submitStatus).toBe('INITIAL');
      expect(state.result).toBeUndefined();
    });

    it('should run validate and warn', () => {
      const values = {foo: 'bar'};

      const validate = jest.fn();
      const warn = jest.fn();

      // eslint-disable-next-line no-new
      new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },

        validate,
        warn,
      });

      expect(validate).toHaveBeenCalledWith(values);
      expect(validate).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(values);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('should populate initial error and warning state', () => {
      const values = {foo: 'bar'};

      const validate = jest.fn(() => 'errors');
      const warn = jest.fn(() => 'warnings');

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },

        validate,
        warn,
      });

      expect(form.getState().errors).toBe('errors');
      expect(form.getState().warnings).toBe('warnings');
    });

    it('should coerce "empty" error and warning values to undefined', () => {
      const values = {foo: 'bar'};

      const validate = () => [[]];
      const warn = () => null;

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },

        validate,
        warn,
      });

      expect(form.getState().errors).toBeUndefined();
      expect(form.getState().warnings).toBeUndefined();
    });

    it('should not coersce falsy error and warning values to null', () => {
      const values = {foo: 'bar'};

      const validate = () => 0;
      const warn = () => false;

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },

        validate,
        warn,
      });

      expect(form.getState().errors).toBe(0);
      expect(form.getState().warnings).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('should call listeners when state changes', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      const listener1 = jest.fn();
      const listener2 = jest.fn();

      form.subscribe(listener1);
      form.subscribe(listener2);

      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(0);

      form.setFieldValue('foo', 'bar');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should not call unsubscribed listeners', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const subscription1 = form.subscribe(listener1);
      const subscription2 = form.subscribe(listener2);

      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(0);

      subscription1.unsubscribe();
      subscription2.unsubscribe();

      form.setFieldValue('foo', 'bar');

      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(0);
    });
  });

  describe('focus', () => {
    it('should set the focused path', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      expect(form.getState().focusedPath).toBeUndefined();

      form.focusField('foo');

      expect(form.getState().focusedPath).toBe('foo');
    });

    it('should mark the incoming path as visited', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      expect(form.getState().visitedMap.foo).not.toBe(true);

      form.focusField('foo');

      expect(form.getState().visitedMap.foo).toBe(true);
    });

    it('should not overwrite existing state', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      expect(form.getState().visitedMap.foo).not.toBe(true);
      expect(form.getState().visitedMap.bar).not.toBe(true);

      form.focusField('foo');
      form.focusField('bar');

      expect(form.getState().visitedMap.foo).toBe(true);
      expect(form.getState().visitedMap.bar).toBe(true);
    });

    it('should mark the previous path as touched', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      expect(form.getState().touchedMap.foo).not.toBe(true);

      form.focusField('foo');
      form.focusField('bar');

      expect(form.getState().touchedMap.foo).toBe(true);
    });

    it('should ignore idempotent state changes', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      const listener = jest.fn();
      form.subscribe(listener);

      expect(listener).toHaveBeenCalledTimes(0);

      form.focusField('foo');

      expect(listener).toHaveBeenCalledTimes(1);

      form.focusField('foo');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('blur', () => {
    it('should set the focused path', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      form.focusField('foo');
      form.blurField('foo');

      expect(form.getState().focusedPath).toBeUndefined();
    });

    it('should mark the incoming path as visited', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      expect(form.getState().visitedMap.foo).not.toBe(true);

      form.blurField('foo');

      expect(form.getState().visitedMap.foo).toBe(true);
    });

    it('should mark the incoming path as touched', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      expect(form.getState().touchedMap.foo).not.toBe(true);

      form.blurField('foo');

      expect(form.getState().touchedMap.foo).toBe(true);
    });

    it('should ensure the outgoing path is marked as touched', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      (form as any)._state.focusedPath = 'foo';

      expect(form.getState().visitedMap.foo).not.toBe(true);
      expect(form.getState().visitedMap.bar).not.toBe(true);
      expect(form.getState().touchedMap.foo).not.toBe(true);
      expect(form.getState().touchedMap.bar).not.toBe(true);

      form.blurField('bar');

      expect(form.getState().visitedMap.foo).toBe(true);
      expect(form.getState().visitedMap.bar).toBe(true);
      expect(form.getState().touchedMap.foo).toBe(true);
      expect(form.getState().touchedMap.bar).toBe(true);
    });

    it('should ignore idempotent state changes', () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: undefined};
          },
        },
      );

      const listener = jest.fn();
      form.subscribe(listener);

      expect(listener).toHaveBeenCalledTimes(0);

      form.blurField('foo');

      expect(listener).toHaveBeenCalledTimes(1);

      form.blurField('foo');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('setValue', () => {
    it('should overwrite the value at a path', () => {
      const values = {foo: 'bar'};

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
      });

      form.setFieldValue('foo', 'foo');

      expect(form.getState().values.foo).toBe('foo');
    });

    it('should run validate and warn', async () => {
      const values = {foo: 'bar'};

      const validate = jest.fn(() => 'errors');
      const warn = jest.fn(() => 'warnings');

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
        validate,
        warn,
      });

      expect(validate).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);

      form.setFieldValue('foo', 'foo');

      expect(validate).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalledTimes(2);

      expect(form.getState().errors).toBe('errors');
      expect(form.getState().warnings).toBe('warnings');
    });

    it('should clear all submit validation errors', async () => {
      const values = {foo: 'bar'};
      const form = new FormState(values, {
        onSubmit() {
          return {ok: false, errors: {foo: 'error'}};
        },
      });

      await form.submit();

      expect(form.getState().submitErrors).toEqual({foo: 'error'});

      form.setFieldValue('foo', 'foo');

      expect(form.getState().submitErrors).toBeUndefined();
    });

    it('should ignore idempotent state changes', () => {
      const values = {foo: 'bar'};

      const validate = jest.fn(() => 'errors');
      const warn = jest.fn(() => 'warnings');

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
        validate,
        warn,
      });

      expect(validate).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);

      const listener = jest.fn();
      form.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(0);

      form.setFieldValue('foo', 'foo');

      expect(listener).toHaveBeenCalledTimes(1);

      expect(validate).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalledTimes(2);

      form.setFieldValue('foo', 'foo');

      expect(listener).toHaveBeenCalledTimes(1);

      expect(validate).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('acceptPendingValue', () => {
    it('should set value equal to pending value at a path', () => {
      const values = {foo: 'bar'};

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
      });

      form.setValues({foo: 'updated'});

      expect(form.getState().pendingValues.foo).toBe('updated');
      expect(form.getState().values.foo).toBe('bar');

      form.acceptPendingFieldValue('foo');

      expect(form.getState().values.foo).toBe('updated');
    });

    it('should run validate and warn', () => {
      const values = {foo: 'bar'};

      const validate = jest.fn(() => 'errors');
      const warn = jest.fn(() => 'warnings');

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
        validate,
        warn,
      });

      expect(validate).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);

      form.setValues({foo: 'updated'});

      form.acceptPendingFieldValue('foo');

      expect(validate).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalledTimes(2);

      expect(form.getState().errors).toBe('errors');
      expect(form.getState().warnings).toBe('warnings');
    });
  });

  describe('rejectPendingValue', () => {
    it('should clear pending value at a path', () => {
      const values = {foo: 'bar'};

      const form = new FormState(values, {
        onSubmit() {
          return {ok: true, data: undefined};
        },
      });

      form.setValues({foo: 'updated'});

      expect(form.getState().pendingValues.foo).toBe('updated');
      expect(form.getState().values.foo).toBe('bar');

      form.rejectPendingFieldValue('foo');

      expect(form.getState().pendingValues.foo).toBe('bar');
    });
  });

  describe('submit', () => {
    it('should handle success result', async () => {
      const form = new FormState(
        {},
        {
          onSubmit() {
            return {ok: true, data: 'result'};
          },
        },
      );

      await expect(form.submit()).resolves.toBeUndefined();

      expect(form.getState().result).toEqual('result');
    });
  });
});
