import ReactDomServer from 'react-dom/server';
import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2Remark from 'rehype-remark';
import rehypeSanitize from 'rehype-sanitize';
import merge from 'deepmerge';
import gh from 'hast-util-sanitize/lib/github.json';
import { Schema } from 'hast-util-sanitize';
import stringify from 'remark-stringify';
import { Transformer } from 'unified';
import { Node } from 'hast';
// import visit from 'unist-util-visit';
import splitParagraph from 'rehype-split-paragraph';
import {
  PagesSourcePages,
  PagesSourcePageMarkdown,
  PagesSourcePageHtml,
  PagesSourcePageImage,
  PagesSourcePageComment,
  PagesSourcePageContent,
  PagesSourcePageContents
} from '../types/client/contentTypes';
import { codeDockHandler } from './codedock';
import siteServerSideConfig from '../src/site.server-side-config';
import { editMarkdown } from './markdown';
var toText = require('hast-util-to-text');
var toHtml = require('hast-util-to-html');

const schema = merge(gh, {
  tagNames: ['u'],
  attributes: {
    span: ['style']
  },
  allowComments: true
});

const fenceToFrontMatterRegExp = /^---\n(.+)\n---\n*$/s;
export function firstParagraphAsCodeDockTransformer(): Transformer {
  return function transformer(tree: Node): void {
    if (tree.type === 'root' && Array.isArray(tree.children)) {
      const idx = tree.children.findIndex(
        (c: Node) => c.type === 'element' && c.tagName === 'p'
      );
      if (idx >= 0) {
        const text = toText(tree.children[idx]);
        // console.log(text);
        const m = text.match(fenceToFrontMatterRegExp);
        if (m) {
          tree.children[idx].tagName = 'pre';
          tree.children[idx].children = [
            {
              type: 'element',
              tagName: 'code',
              children: [
                {
                  type: 'text',
                  // value: text
                  // ---\nfoo:bar\n--- だと qrcode 変換でつかっている
                  // mdast-util-from-markdown で heading として扱われる。
                  // この辺がうまくいかない場合、mdast-util-frontmattera も検討
                  value: `===md\n---\n\n${m[1]}\n\n---\n`
                }
              ]
            }
          ];
        }
      }
    }
  };
}

const htmlToMarkdownProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(firstParagraphAsCodeDockTransformer)
  .use(splitParagraph)
  .use(rehypeSanitize, (schema as unknown) as Schema)
  .use(rehype2Remark, {
    //newlines: false,
    handlers: {
      pre: codeDockHandler,
      u: (h: any, node: any) => {
        return h(node, 'html', toHtml(node));
      },
      span: (h: any, node: any) => {
        return h(node, 'html', toHtml(node));
      },
      br: (h: any, node: any) => {
        // <br> が `/` になってしまうので暫定対応
        return h(node, 'text', ' ');
      }
    }
  })
  .use(stringify)
  .freeze();

const imageToMarkdownProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, (schema as unknown) as Schema)
  .use(rehype2Remark, {})
  .use(stringify)
  .freeze();

export function pageMarkdownMarkdown(
  markdown: PagesSourcePageMarkdown
): string {
  if (
    markdown.markdown &&
    markdown.markdown[markdown.markdown.length - 1] === '\n'
  ) {
    return `${markdown.markdown}`;
  }
  return `${markdown.markdown}\n`;
}
export async function pageHtmlMarkdown(
  html: PagesSourcePageHtml
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (html.html) {
      htmlToMarkdownProcessor.process(html.html, function (err, file) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          // とりあえず暫定で改ページさせる
          const markdown = `${file}`.replace(/\\---/g, '---');
          // console.log(markdown);
          if (markdown && markdown[markdown.length - 1] === '\n') {
            resolve(markdown);
            return;
          }
          resolve(`${markdown}\n`);
        }
      });
    }
    resolve('');
  });
}
export async function pageImageMarkdown(
  image: PagesSourcePageImage
): Promise<string> {
  // 試した限りでは、markdown の eescape は rehype から remakr にするのが良いように思える.
  return new Promise((resolve, reject) => {
    const params =
      image.transform || siteServerSideConfig.source.image.transformDefault;
    const q = new URLSearchParams(params).toString();
    const url = q ? `${image.image.url}?${q}` : image.image.url;
    const img = <img src={url} alt={image.directive} />;
    imageToMarkdownProcessor.process(
      ReactDomServer.renderToStaticMarkup(img),
      function (err, file) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(`${file}`);
        }
      }
    );
  });
}
export function pageCommentMarkdown(comment: PagesSourcePageComment): string {
  return `<!-- ${ReactDomServer.renderToStaticMarkup(
    <>{comment.comment || ''}</>
  )} -->\n`;
}

export async function _pageMarkdown(
  content: PagesSourcePageContent
): Promise<string> {
  switch (content.fieldId) {
    case 'sourceMarkdown':
      return pageMarkdownMarkdown(content);
    case 'sourceHtml':
      return await pageHtmlMarkdown(content);
    case 'sourceImage':
      return await pageImageMarkdown(content);
    case 'sourceComment':
      return pageCommentMarkdown(content);
  }
  return '';
}

export async function pageMarkdown(
  page: PagesSourcePageContents
): Promise<string> {
  return (
    await Promise.all(page.map((p) => (async () => await _pageMarkdown(p))()))
  ).join('\n');
}

export async function pagesMarkdown(
  sourcePages: PagesSourcePages
): Promise<string> {
  return (
    await Promise.all(
      sourcePages.map(({ contents }) =>
        (async () => await pageMarkdown(contents))()
      )
    )
  ).join('\n---\n\n');
}

export async function htmlToMarkdown(html: string): Promise<string> {
  const md = await pageHtmlMarkdown({
    fieldId: 'sourceHtml',
    html
  });
  // console.log(md);
  // return md;
  // console.log(await editMarkdown(md));
  return await editMarkdown(md);
}

export async function sourceSetMarkdown(sourceSet: {
  sourceContents?: PagesSourcePageContents;
  sourcePages?: PagesSourcePages;
  source?: string;
}): Promise<string> {
  // 現状の deck API の スキーマだと sourcePages はセットされないが
  // いちおう残しておく。
  if (sourceSet.source) {
    return htmlToMarkdown(sourceSet.source);
  } else if (sourceSet.sourceContents && sourceSet.sourceContents.length > 0) {
    return pageMarkdown(sourceSet.sourceContents);
  } else if (sourceSet.sourcePages && sourceSet.sourcePages.length > 0) {
    return pagesMarkdown(sourceSet.sourcePages);
  }
  return '';
}
