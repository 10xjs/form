/* eslint-env node */

module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV);

  const config = {
    presets: [
      ['@babel/preset-env', {shippedProposals: true}],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-object-assign',
    ],
  };

  if (process.env.NODE_ENV === 'test') {
    config.plugins = [...config.plugins, '@babel/plugin-transform-runtime'];
  }

  return config;
};
