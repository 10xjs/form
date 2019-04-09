import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
  input: './src/index.tsx',
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
    sourcemapPathTransform: (sourcePath) =>
      path.join('node_modules', pkg.name, path.dirname(pkg.main), sourcePath),
  },
  plugins: [
    resolve({extensions}),
    commonjs(),
    babel({exclude: 'node_modules/**', extensions}),
  ],
  external: ['es6-error', 'react', 'hoist-non-react-statics'],
};
