import {TypedContext} from './Context';
import {TypedForm} from './Form';
import {input, checkbox} from './fieldHelpers';
import {TypedProvider} from './Provider';
import SubmitConcurrencyError from './SubmitConcurrencyError';
import SubmitValidationError from './SubmitValidationError';
import useField from './useField';
import useFieldStatus from './useFieldStatus';
import {
  TypedUseForm,
  Interface,
  State,
  STATUS_INITIAL,
  STATUS_STARTED,
  STATUS_FAILED,
  STATUS_ENDED,
} from './useForm';
import {TypedUseContext} from './useContext';
import {TypedUseStatus, Status} from './useStatus';

export interface TypedModule<
  Values,
  Result,
  ReturnedResult = Result,
  Errors = null,
  Warnings = null
> {
  Context: TypedContext<Values, Result, ReturnedResult, Errors, Warnings>;
  Form: TypedForm<Values, Result, ReturnedResult, Errors, Warnings>;
  input: typeof input;
  checkbox: typeof checkbox;
  Provider: TypedProvider<Values, Result, ReturnedResult, Errors, Warnings>;
  SubmitConcurrencyError: typeof SubmitConcurrencyError;
  SubmitValidationError: typeof SubmitValidationError;
  useField: typeof useField;
  useFieldStatus: typeof useFieldStatus;
  useForm: TypedUseForm<Values, Result, ReturnedResult, Errors, Warnings>;
  useContext: TypedUseContext<Values, Result, ReturnedResult, Errors, Warnings>;
  STATUS_INITIAL: typeof STATUS_INITIAL;
  STATUS_STARTED: typeof STATUS_STARTED;
  STATUS_FAILED: typeof STATUS_FAILED;
  STATUS_ENDED: typeof STATUS_ENDED;
  useStatus: TypedUseStatus<Result>;
}

export type InterfaceOf<M> = M extends TypedModule<
  infer V,
  infer R,
  infer RR,
  infer E,
  infer W
>
  ? Interface<V, R, RR, E, W>
  : never;

export type StateOf<M> = M extends TypedModule<
  infer V,
  infer R,
  infer RR,
  infer E,
  infer W
>
  ? State<V, R, E, W>
  : never;

export type StatusOf<M> = M extends TypedModule<
  infer V,
  infer R,
  infer RR,
  infer E,
  infer W
>
  ? Status<R>
  : never;
