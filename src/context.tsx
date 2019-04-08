import * as React from 'react';
import {Context} from './types';

export const {Provider, Consumer} = React.createContext<Context | null>(null);
