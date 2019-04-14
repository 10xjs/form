import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const plugins = [
  resolve({extensions}),
  commonjs(),
  babel({exclude: 'node_modules/**', extensions}),
];

const external = ['es6-error', 'react', 'hoist-non-react-statics'];
const umdGlobals = {react: 'React'};

const sourcemapPathTransform = (sourcePath) =>
  path.join('node_modules', pkg.name, './src', sourcePath);

export default [
  {
    input: './src/index.tsx',
    output: {
      file: './umd/form.js',
      format: 'umd',
      exports: 'named',
      name: 'Form',
      globals: umdGlobals,
    },
    external: Object.keys(umdGlobals),
    plugins: plugins,
  },
  {
    input: './src/index.tsx',
    output: {
      file: './umd/form.min.js',
      format: 'umd',
      exports: 'named',
      name: 'Form',
      globals: umdGlobals,
    },
    external: Object.keys(umdGlobals),
    plugins: [terser(), ...plugins],
  },
  {
    input: {
      context: './src/context.tsx',
      Field: './src/Field.tsx',
      FieldArray: './src/FieldArray.tsx',
      Form: './src/Form.tsx',
      index: './src/index.tsx',
      renderWrapper: './src/renderWrapper.tsx',
      StateProvider: './src/StateProvider.tsx',
      SubmitValidationError: './src/SubmitValidationError.tsx',
      util: './src/util.tsx',
    },
    output: [
      {
        dir: 'module',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
        sourcemapPathTransform,
      },
      {
        dir: 'lib',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        sourcemapPathTransform,
      },
    ],
    plugins,
    external,
  },
];
