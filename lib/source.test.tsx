import unified from 'unified';
import rehypeParse from 'rehype-parse';
import stringify from 'rehype-stringify';
import {
  splitParagraphTransformer,
  removeBlankTransformer,
  pageMarkdownMarkdown,
  pageImageMarkdown,
  pageCommentMarkdown,
  pagesMarkdown,
  pageMarkdown,
  sourceSetMarkdown,
  firstParagraphAsCodeDockTransformer
} from './source';

describe('splitParagraphTransformer()', () => {
  const f = async (html: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(splitParagraphTransformer)
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
  it('should split paragraph by br duplicated', async () => {
    expect(await f('<p>test1</p>')).toEqual('<p>test1</p>');
    expect(await f('<p>test2<br>tet3</p>')).toEqual('<p>test2<br>tet3</p>');
    expect(await f('<p>test4<br><br>test5</p>')).toEqual(
      '<p>test4</p><p>test5</p>'
    );
    expect(await f('<p>test6</p><ul><li>test7</li></ul><p>test8</p>')).toEqual(
      '<p>test6</p><ul><li>test7</li></ul><p>test8</p>'
    );
    expect(
      await f(
        '<p>test9<br><br>test10</p><ul><li>test11</li></ul><p>test12<br><br>test13</p>'
      )
    ).toEqual(
      '<p>test9</p><p>test10</p><ul><li>test11</li></ul><p>test12</p><p>test13</p>'
    );
    expect(await f('<p>test14<br><br><br>test15</p>')).toEqual(
      '<p>test14</p><p>test15</p>'
    );
    expect(await f('<p>test16<br>test17<br>test18<br>test19</p>')).toEqual(
      '<p>test16<br>test17<br>test18<br>test19</p>'
    );
  });
  it('should split paragraph by br+img or img+br ', async () => {
    expect(await f('<p>test1<img src="image1">test2</p>')).toEqual(
      '<p>test1<img src="image1">test2</p>'
    );
    expect(await f('<p>test3<br><img src="image2">test4</p>')).toEqual(
      '<p>test3<br></p><p><img src="image2">test4</p>'
    );
    expect(await f('<p>test5<img src="image3"><br>test5</p>')).toEqual(
      '<p>test5<img src="image3"></p><p><br>test5</p>'
    );
  });
});

describe('removeBlankTransformer()', () => {
  const f = async (html: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(removeBlankTransformer)
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
  it('should trim leading/trailing <br> element', async () => {
    expect(await f('<p>test1</p>')).toEqual('<p>test1</p>');
    expect(await f('<p>test2<br></p>')).toEqual('<p>test2</p>');
    expect(await f('<p><br>test3</p>')).toEqual('<p>test3</p>');
    expect(await f('<p><br><br>test4<br>test5<br><br></p>')).toEqual(
      '<p>test4<br>test5</p>'
    );
    expect(
      await f('<p><br><br>test6<br>test7<br><br></p><p>test8<br><br></p>')
    ).toEqual('<p>test6<br>test7</p><p>test8</p>');
  });
  it('should remove blank paragraph', async () => {
    expect(await f('<p></p>')).toEqual('');
    expect(await f('<p><br></p>')).toEqual('');
    expect(await f('<p>test1</p><p><br></p><p>test2</p>')).toEqual(
      '<p>test1</p><p>test2</p>'
    );
  });
});

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
