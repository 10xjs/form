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

const external = ['react'];
const umdGlobals = {react: 'React'};

const sourcemapPathTransform = (sourcePath) =>
  path.join('node_modules', pkg.name, './src', sourcePath);

export default [
  {
    input: './src/index.ts',
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
    input: './src/index.ts',
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
      context: './src/react/context.tsx',
      field: './src/react/field.ts',
      fields: './src/react/fields.tsx',
      fieldStatus: './src/react/fieldStatus.ts',
      form: './src/react/form.tsx',
      formState: './src/react/formState.ts',
      formStatus: './src/react/formStatus.ts',
      index: './src/index.ts',
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
