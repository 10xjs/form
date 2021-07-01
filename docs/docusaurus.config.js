const manifest = require('../packages/form/package.json');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  baseUrlIssueBanner: false,
  trailingSlash: false,
  title: '@10xjs/form',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: {
      en: {},
    },
  },
  noIndex: false,
  onDuplicateRoutes: 'throw',
  url: 'https://form.10xjs.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: '10xjs',
  projectName: 'form',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [
            [
              require('remark-plugin-mermaid'),
              {config: {flowchart: {fontSize: 16}}},
            ],
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
          editUrl: 'https://github.com/10xjs/form/edit/master/website/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../packages/form/src/index.ts'],
        tsconfig: '../packages/form/typedoc.tsconfig.json',
        externalPattern: ['**/node_modules/**'],
        sidebar: {
          sidebarFile: null,
        },
        watch: process.env.TYPEDOC_WATCH,
        readme: 'none',
        globalsTitle: 'API',
        allReflectionsHaveOwnDocument: true,
        disableSources: true,
        excludeExternals: true,
        excludePrivate: true,
        excludeProtected: true,
        listInvalidSymbolLinks: true,
      },
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
      switchConfig: {
        darkIcon: '🌑',
        lightIcon: '😎',
      },
    },
    prism: {
      theme: require('prism-react-renderer/themes/nightOwlLight'),
      darkTheme: require('prism-react-renderer/themes/nightOwl'),
    },
    navbar: {
      hideOnScroll: true,
      title: manifest.name,
      logo: {
        alt: manifest.name,
        src: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
      },
      items: [
        {
          to: 'docs/installation',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'docs/api/',
          label: 'API',
          position: 'left',
        },
        {
          href: 'https://github.com/10xjs/form',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Neal Granger.`,
    },
  },
};
