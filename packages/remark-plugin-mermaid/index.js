const crypto = require('crypto');
const visit = require('unist-util-visit');
const puppeteer = require('puppeteer');
const {optimize} = require('svgo');

module.exports = function ({
  darkTheme = 'dark',
  lightTheme = 'default',
  config = {},
} = {}) {
  /** @type {import('puppeteer').Page} */
  let _page;

  async function getPage() {
    if (_page === undefined) {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      _page = (await browser.pages())[0];

      await _page.setViewport({width: 1280, height: 1280});

      await _page.addScriptTag({
        path: require.resolve('mermaid/dist/mermaid.min.js'),
      });
    }

    return _page;
  }

  async function render(id, config, def) {
    return await (
      await getPage()
    ).evaluate(
      (id, config, def) => {
        window.mermaid.initialize(config);

        const container = document.createElement('div');
        container.innerHTML = window.mermaid.mermaidAPI.render(id, def);

        const style = container.querySelector('style');
        style?.parentElement?.removeChild(style);

        return [style?.innerHTML ?? '', container.innerHTML];
      },
      id,
      config,
      def,
    );
  }

  async function transformNode(node) {
    const id =
      'm-' +
      crypto.createHash('md5').update(node.value).digest('hex').slice(0, 8);

    const [light, svg] = await render(
      id,
      {...config, theme: lightTheme},
      node.value,
    );
    const [dark] = await render(id, {...config, theme: darkTheme}, node.value);

    const style = `
<style>
${light}
${dark.replace(new RegExp(`#${id}`, 'g'), `html[data-theme=dark] #${id}`)}
</style>
`;

    node.value = (
      await optimize(svg.replace('>', `>${style}`), {
        plugins: [
          {name: 'cleanupIDs', active: false},
          {name: 'inlineStyles', active: false},
          {name: 'convertStyleToAttrs', active: false},
          {name: 'minifyStyles', params: {usage: {tags: false}}},
        ],
      })
    ).data;

    node.type = 'html';
  }

  return function transformer(tree, file, next) {
    /** @type {import('unist').Node[]} */
    const nodes = [];

    visit(tree, 'code', (node) => {
      if (node.type === 'code' && /^mermaid$/i.test(node.lang)) {
        nodes.push(node);
      }
    });

    Promise.all(
      nodes.map((node) => {
        return transformNode(node);
      }),
    ).then(() => next(), next);
  };
};
