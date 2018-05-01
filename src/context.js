// @flow
import * as React from 'react';
import type {FormState} from './types';

const initialState: FormState | null = null;
export const {Provider, Consumer} = React.createContext(initialState);
