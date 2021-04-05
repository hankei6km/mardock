import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2Remark from 'rehype-remark';
import stringify from 'remark-stringify';
import { codeDockKind, codeDockHandler } from './codedock';

describe('codeDockKind()', () => {
  it('should return kind of CodeDock', () => {
    expect(codeDockKind('===md\ndock1')).toEqual('markdown');
  });
});

describe('codeDockHandler()', () => {
  const f = async (html: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehype2Remark, {
          handlers: { pre: codeDockHandler }
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
  it('should convert codeblock to raw markdown', async () => {
    expect(await f('<p>test1</p>')).toEqual('test1\n');
    expect(
      await f('<p>test2</p><pre><code>code1</code></pre><p>test3</p>')
    ).toEqual('test2\n\n    code1\n\ntest3\n');
    expect(
      await f('<p>test4</p><pre><code>===md\ndock1</code></pre><p>test5</p>')
    ).toEqual('test4\n\ndock1\n\n\ntest5\n');
    expect(await f('<pre><code>===md\ndock2</code></pre><p>test6</p>')).toEqual(
      'dock2\n\n\ntest6\n'
    );
  });
});
