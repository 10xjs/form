import React from 'react';

import {
  Field,
  FieldStatus,
  Form,
  FormProvider,
  FormState,
  FormStatus,
  SubmitError,
  SubmitValidationError,
  fields,
  useField,
  useFieldStatus,
  useForm,
  useFormState,
  useFormStatus,
} from '@10xjs/form';

const ReactLiveScope = {
  Field,
  FieldStatus,
  Form,
  FormProvider,
  FormState,
  FormStatus,
  SubmitError,
  SubmitValidationError,
  fields,
  useField,
  useFieldStatus,
  useForm,
  useFormState,
  useFormStatus,
  React,
  ...React,
};

export default ReactLiveScope;
