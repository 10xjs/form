import * as React from 'react';

import {FormProps, FormWrapperProps, Context, FormActions, Path} from './types';

import {Provider} from './context';

import StateProvider from './StateProvider';

class FormWrapper extends React.PureComponent<FormWrapperProps> {
  public render(): React.ReactNode {
    return this.props.children(
      Object.assign({}, this.props.actions, {
        submitting: this.props.submitting,
        submitFailed: this.props.submitFailed,
        submitSucceeded: this.props.submitSucceeded,
        hasErrors: this.props.hasErrors,
        hasSubmitErrors: this.props.hasSubmitErrors,
        hasWarnings: this.props.hasWarnings,
      }),
    );
  }
}

class Form extends React.PureComponent<FormProps, Context>
  implements FormActions {
  public static defaultProps = {
    values: {},
    onSubmit: (): void => {},
    onSubmitFail: (error: Error): Promise<void> => Promise.reject(error),
    onSubmitSuccess: (): void => {},
    onSubmitValidationFail: (): void => {},
    warn: (): null => null,
    validate: (): null => null,
  };

  private _lastSetActions: FormActions | undefined;
  public setValue: (path: Path, value: unknown) => void = (): void => {};
  public setInitialValue: (path: Path, value: unknown) => void = (): void => {};
  public setPendingValue: (path: Path, value: unknown) => void = (): void => {};
  public setTouched: (path: Path, touched: boolean) => void = (): void => {};
  public setVisited: (path: Path, visited: boolean) => void = (): void => {};
  public setFocused: (path: Path, focused: boolean) => void = (): void => {};
  public submit: (
    event?: Event | React.SyntheticEvent<HTMLElement>,
  ) => void = (): void => {};

  public render(): React.ReactNode {
    return (
      <StateProvider {...this.props}>
        {(context: Context): React.ReactNode => {
          if (this._lastSetActions !== context.actions) {
            Object.assign(this, context.actions);
            this._lastSetActions = context.actions;
          }
          return (
            <Provider value={context}>
              <FormWrapper
                actions={context.actions}
                submitting={context.submitting}
                submitFailed={context.submitFailed}
                submitSucceeded={context.submitSucceeded}
                hasErrors={context.errorState !== null}
                hasSubmitErrors={context.submitErrorState !== null}
                hasWarnings={context.warningState !== null}
              >
                {this.props.children}
              </FormWrapper>
            </Provider>
          );
        }}
      </StateProvider>
    );
  }
}

export default Form;
