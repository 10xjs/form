const esbuild = require('esbuild');
const pkg = require('./package.json');

const options = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  external: ['react'],
  target: 'es2015',
};

(async () => {
  await esbuild.build({...options, outfile: pkg.main, format: 'cjs'});

  await esbuild.build({...options, outfile: pkg.module, format: 'esm'});
})();
