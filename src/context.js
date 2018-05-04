// @flow strict

import * as React from 'react';
import type {Context} from './types';

const initialState: Context | null = null;
export const {Provider, Consumer} = React.createContext(initialState);
