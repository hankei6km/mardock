import unified from 'unified';
import rehypeParse from 'rehype-parse';
import stringify from 'rehype-stringify';
import {
  pageMarkdownMarkdown,
  pageImageMarkdown,
  pageCommentMarkdown,
  pagesMarkdown,
  pageMarkdown,
  sourceSetMarkdown,
  firstParagraphAsCodeDockTransformer,
  pageHtmlMarkdown,
  imageQueryTransformer,
  imageAsThumbTransformer
} from './source';

describe('firstParagraphAsCodeDockTransformer()', () => {
  const f = async (html: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(firstParagraphAsCodeDockTransformer)
        .use(stringify)
        .freeze()
        .process(html, (err, file) => {
          if (err) {
            reject(err);
          }
          resolve(String(file));
        });
    });
  };
  it('should convert paragraph like frontmatter to codedock', async () => {
    expect(await f('<p>test1</p>')).toEqual('<p>test1</p>');
    expect(await f('<p>tes2</p><p>tes3</p>')).toEqual('<p>tes2</p><p>tes3</p>');
    expect(await f('<p>---<br>foo:bar<br>---<br></p><p>tes4</p>')).toEqual(
      '<pre><code>===md\n---\n\nfoo:bar\n\n---\n</code></pre><p>tes4</p>'
    );
    expect(
      await f(
        '<p>---<br>foo:&lt;/code&gt;&lt;/pre&gt;<br>---<br></p><p>tes4</p>'
      )
    ).toEqual(
      '<pre><code>===md\n---\n\nfoo:&#x3C;/code>&#x3C;/pre>\n\n---\n</code></pre><p>tes4</p>'
    );
  });
});

describe('imageQueryTransformer()', () => {
  const f = async (html: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(imageQueryTransformer, {
          start: 'https://',
          defaultParams: 'auto=compress'
        })
        .use(stringify)
        .freeze()
        .process(html, (err, file) => {
          if (err) {
            reject(err);
          }
          resolve(String(file));
        });
    });
  };
  it('should convert image to query params edited', async () => {
    expect(await f('<img src="https://test/i.jpg">')).toEqual(
      '<img src="https://test/i.jpg?auto=compress">'
    );
    expect(await f('<img src="https://test/i.jpg?w=100&h=100">')).toEqual(
      '<img src="https://test/i.jpg?w=100&#x26;h=100&#x26;auto=compress">'
    );
    expect(
      await f('<img src="https://test/i.jpg?w=100&h=100" alt="test">')
    ).toEqual(
      '<img src="https://test/i.jpg?w=100&#x26;h=100&#x26;auto=compress" alt="test">'
    );
    expect(
      await f(
        '<img src="https://test/i.jpg?w=100&h=100" alt="test:q:auto=enhance">'
      )
    ).toEqual(
      '<img src="https://test/i.jpg?w=100&#x26;h=100&#x26;auto=enhance" alt="test">'
    );
  });
});

describe('imageAsThumbTransformer()', () => {
  const f = async (html: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(imageAsThumbTransformer, { defaultParams: '' })
        .use(stringify)
        .freeze()
        .process(html, (err, file) => {
          if (err) {
            reject(err);
          }
          resolve(String(file));
        });
    });
  };
  it('should convert image to as thumbnail', async () => {
    expect(
      await f('<a href="thumb.jpg"><img src="https://test/i.jpg"></a>')
    ).toEqual(
      '<a href="https://test/i.jpg"><img src="https://test/i.jpg"></a>'
    );
    expect(
      await f(
        '<a href="thumb.jpg"><img src="https://test/i.jpg?w=100&h=100"></a>'
      )
    ).toEqual(
      '<a href="https://test/i.jpg"><img src="https://test/i.jpg?w=100&#x26;h=100"></a>'
    );
    expect(
      await f(
        '<a href="thumb.jpg?w=1000"><img src="https://test/i.jpg?w=100&h=100"></a>'
      )
    ).toEqual(
      '<a href="https://test/i.jpg?w=1000"><img src="https://test/i.jpg?w=100&#x26;h=100"></a>'
    );
  });
});

describe('pageMarkdownMarkdown()', () => {
  it('should returns markdown from markdown source', () => {
    expect(
      pageMarkdownMarkdown({
        fieldId: 'sourceMarkdown',
        markdown: 'test1'
      })
    ).toEqual('test1\n');
    expect(
      pageMarkdownMarkdown({
        fieldId: 'sourceMarkdown',
        markdown: 'test2\n'
      })
    ).toEqual('test2\n');
    expect(
      pageMarkdownMarkdown({
        fieldId: 'sourceMarkdown',
        markdown: ''
      })
    ).toEqual('\n');
  });
});

describe('pageHtmlMarkdown()', () => {
  it('should returns markdown from html source', async () => {
    expect(
      await pageHtmlMarkdown({
        fieldId: 'sourceHtml',
        html: '<p>test1</p><p>test2</p>'
      })
    ).toEqual('test1\n\ntest2\n');
    expect(
      await pageHtmlMarkdown({
        fieldId: 'sourceHtml',
        html: '<ul><li>test1</li><li>test2</li></ul>'
      })
    ).toEqual('*   test1\n*   test2\n');
    expect(
      await pageHtmlMarkdown({
        fieldId: 'sourceHtml',
        html: '<p>test1\ntest2</p>'
      })
    ).toEqual('test1 test2\n');
    expect(
      await pageHtmlMarkdown({
        fieldId: 'sourceHtml',
        html: '<p>test<u>under</u>test</p>'
      })
    ).toEqual('test<u>under</u>test\n');
    expect(
      await pageHtmlMarkdown({
        fieldId: 'sourceHtml',
        html: '<p>test<span style="color:red;">under</span>test</p>'
      })
    ).toEqual('test<span style="color:red;">under</span>test\n');
  });
});

describe('pageImageMarkdown()', () => {
  it('should returns markdown from image source', async () => {
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'test1.jpg', width: 100, height: 100 },
        directive: ''
      })
    ).toEqual('![](test1.jpg?w=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 't)est2.jpg', width: 100, height: 100 },
        directive: ''
      })
    ).toEqual('![](t\\)est2.jpg?w=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'test3.jpg', width: 100, height: 100 },
        directive: 'b]g'
      })
    ).toEqual('![b\\]g](test3.jpg?w=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'test 4.jpg', width: 100, height: 100 },
        directive: 'bg'
      })
    ).toEqual('![bg](<test 4.jpg?w=600>)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: '<test5.jpg>', width: 100, height: 100 },
        directive: 'bg'
      })
    ).toEqual('![bg](\\<test5.jpg>?w=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'test6.jpg', width: 100, height: 100 },
        directive: 'b<br>g'
      })
    ).toEqual('![b\\<br>g](test6.jpg?w=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'test7.jpg', width: 100, height: 100 },
        directive: 'bg',
        transform: 'w=300&h=600'
      })
    ).toEqual('![bg](test7.jpg?w=300\\&h=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'test8.jpg', width: 100, height: 100 },
        directive: 'bg',
        transform: '&w=300&h=600'
      })
    ).toEqual('![bg](test8.jpg?w=300\\&h=600)\n');
    expect(
      await pageImageMarkdown({
        fieldId: 'sourceImage',
        image: { url: 'script:alert(123)', width: 100, height: 100 },
        directive: 'bg'
      })
    ).toEqual('![bg]()\n');
  });
});

describe('await pageCommentMarkdown()', () => {
  it('should returns markdown from comment source', () => {
    expect(
      pageCommentMarkdown({
        fieldId: 'sourceComment',
        comment: 'test1'
      })
    ).toEqual('<!-- test1 -->\n');
    expect(
      pageCommentMarkdown({
        fieldId: 'sourceComment',
        comment: 'test\n3'
      })
    ).toEqual('<!-- test\n3 -->\n');
    expect(
      pageCommentMarkdown({
        fieldId: 'sourceComment',
        comment: '<test2>'
      })
    ).toEqual('<!-- &lt;test2&gt; -->\n');
    expect(
      pageCommentMarkdown({
        fieldId: 'sourceComment',
        comment: ''
      })
    ).toEqual('<!--  -->\n');
  });
});

describe('pageMarkdown()', () => {
  it('should returns markdown from page source', async () => {
    expect(
      await pageMarkdown([
        {
          fieldId: 'sourceMarkdown',
          markdown: 'test1'
        },
        {
          fieldId: 'sourceMarkdown',
          markdown: 'test2'
        }
      ])
    ).toEqual('test1\n\ntest2\n');
    expect(
      await pageMarkdown([
        {
          fieldId: 'sourceMarkdown',
          markdown: 'test1'
        },
        {
          fieldId: 'sourceImage',
          image: {
            url: 'test2',
            width: 100,
            height: 100
          }
        }
      ])
    ).toEqual('test1\n\n![](test2?w=600)\n');
    expect(
      await pageMarkdown([
        {
          fieldId: 'sourceMarkdown',
          markdown: 'test1'
        },
        {
          fieldId: 'sourceImage',
          image: {
            url: 'test2',
            width: 100,
            height: 100
          }
        },
        {
          fieldId: 'sourceComment',
          comment: 'test3'
        }
      ])
    ).toEqual('test1\n\n![](test2?w=600)\n\n<!-- test3 -->\n');
  });
});

describe('pagesMarkdown()', () => {
  it('should returns markdown from pages source', async () => {
    expect(
      await pagesMarkdown([
        {
          fieldId: 'sourcePages',
          contents: [
            {
              fieldId: 'sourceMarkdown',
              markdown: 'test1'
            }
          ]
        },
        {
          fieldId: 'sourcePages',
          contents: [
            {
              fieldId: 'sourceMarkdown',
              markdown: 'test2'
            }
          ]
        }
      ])
    ).toEqual('test1\n\n---\n\ntest2\n');
  });
});

describe('sourceSetMarkdown()', () => {
  it('should returns markdown from srouce set', async () => {
    expect(
      await sourceSetMarkdown({
        sourcePages: [
          {
            fieldId: 'sourcePages',
            contents: [
              {
                fieldId: 'sourceMarkdown',
                markdown: 'test1'
              }
            ]
          }
        ]
      })
    ).toEqual('test1\n');
    expect(await sourceSetMarkdown({ source: '<h1>test2</h1>' })).toEqual(
      '# test2\n'
    );
    expect(
      await sourceSetMarkdown({
        sourcePages: [
          {
            fieldId: 'sourcePages',
            contents: [
              {
                fieldId: 'sourceMarkdown',
                markdown: 'test3'
              }
            ]
          }
        ],
        source: '<h1>test4</h1>'
      })
    ).toEqual('# test4\n');
  });
});
