const manifest = require('../package.json');

module.exports = {
  title: '@10xjs/form',
  url: 'https://your-docusaurus-test-site.com',
  organizationName: '10xjs',
  projectName: 'form',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [
            [
              require('./remark-mermaid.js'),
              {config: {flowchart: {fontSize: 16}}},
            ],
          ],
        },
        theme: {
          customCss: [require.resolve('./theme.css')],
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        inputFiles: ['../src'],
        exclude: ['**/*.test.ts?(x)'],
        externalPattern: ['**/node_modules/**'],
        sidebar: {
          // readmeLabel: 'Overview',
          globalsLabel: 'Overview',
        },
        mode: 'file',
        readme: 'none',
        // readmeTitle: 'API',
        globalsTitle: 'API',
        hideProjectName: true,
        allReflectionsHaveOwnDocument: true,
        tsconfig: 'tsconfig.json',
        jsx: 'preserve',
        target: 'esnext',
        moduleResolution: 'node',
        strict: true,
        disableSources: true,
        excludeExternals: true,
        excludeNotExported: true,
        excludePrivate: true,
        excludeProtected: true,
        includeDeclarations: true,
        listInvalidSymbolLinks: true,
        stripInternal: true,
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
        src:
          'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
      },
      items: [
        {
          to: '/api/',
          activeBasePath: 'api',
          label: 'API',
          position: 'left',
        },
        {
          to: '/examples/',
          activeBasePath: 'examples',
          label: 'Examples',
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
