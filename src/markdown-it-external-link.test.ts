import MarkdownIt from 'markdown-it';
const externalLinkPlugin = require('../src/markdown-it-external-link');

describe('externalLinkPlugin()', () => {
  it('should add target="_blank" to <a> tag', async () => {
    const md = new MarkdownIt();
    md.use(externalLinkPlugin);
    expect(md.render('test1[test2](foo)test3')).toEqual(
      '<p>test1<a href="foo" target="_blank" rel="noopener noreferrer">test2</a>test3</p>\n'
    );
    expect(md.render('test1[![test2](bar)](foo)test3')).toEqual(
      '<p>test1<a href="foo" target="_blank" rel="noopener noreferrer"><img src="bar" alt="test2"></a>test3</p>\n'
    );
  });
});
