import path from 'path';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const plugins = [
  resolve(),
  typescript({
    tsconfig: 'build.tsconfig.json',
    useTsconfigDeclarationDir: true,
    cacheRoot: './node_modules/.cache/rpt2',
  }),
];

const external = ['es6-error', 'react'];
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
      formContext: './src/formContext.tsx',
      Form: './src/Form.tsx',
      fieldHelpers: './src/fieldHelpers.tsx',
      Provider: './src/Provider.tsx',
      index: './src/index.tsx',
      SubmitConcurrencyError: './src/SubmitConcurrencyError.tsx',
      SubmitValidationError: './src/SubmitValidationError.tsx',
      useField: './src/useField.tsx',
      useFieldStatus: './src/useFieldStatus.tsx',
      useForm: './src/useForm.tsx',
      useFormContext: './src/useFormContext.tsx',
      useStatus: './src/useStatus.tsx',
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
