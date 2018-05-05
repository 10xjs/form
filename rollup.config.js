import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';

export default {
  output: {
    format: 'cjs',
    exports: 'named',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    minify({
      comments: false,
    }),
  ],
  external: ['es6-error', 'react', 'hoist-non-react-statics'],
};
