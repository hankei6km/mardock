import ReactDomServer from 'react-dom/server';
import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2Remark from 'rehype-remark';
import rehypeSanitize from 'rehype-sanitize';
import stringify from 'remark-stringify';
import { Transformer } from 'unified';
import { Node, Element } from 'hast';
// import visit from 'unist-util-visit';
import {
  PagesSourcePages,
  PagesSourcePageMarkdown,
  PagesSourcePageHtml,
  PagesSourcePageImage,
  PagesSourcePageComment,
  PagesSourcePageContent,
  PagesSourcePageContents
} from '../types/client/contentTypes';
import siteServerSideConfig from '../src/site.server-side-config';
const preHandler = require('hast-util-to-mdast/lib/handlers').pre;
var toHtml = require('hast-util-to-html');

export const CodeDockKindValues = ['markdown', 'comment'] as const;
export type CodeDockKind = typeof CodeDockKindValues[number];

const codeDockRegExp = new RegExp(`^===+(${CodeDockKindValues.join('|')})`);
const blockRegExp = /^===+(markdown|comment)\n/;
function isCodeDock(node: Element): boolean {
  return (
    Array.isArray(node.children) &&
    node.children.length === 1 &&
    node.children[0].type === 'element' &&
    node.children[0].tagName === 'code' &&
    Array.isArray(node.children[0].children) &&
    node.children[0].children.length === 1 &&
    node.children[0].children[0].type === 'text' &&
    node.children[0].children[0].value.match(codeDockRegExp) !== null
  );
}
export function codeDockKind(value: string): CodeDockKind | undefined {
  const m = value.match(codeDockRegExp);
  if (m) {
    switch (m[1]) {
      case 'markdown':
        return 'markdown';
      case 'comment':
        return 'comment';
    }
  }
  return;
}

export function splitParagraphTransformer(): Transformer {
  return function transformer(tree: Node): void {
    if (tree.type === 'root' && Array.isArray(tree.children)) {
      const children: Node[] = [];
      tree.children.forEach((c: Node) => {
        if (
          c.type === 'element' &&
          c.tagName === 'p' &&
          Array.isArray(c.children)
        ) {
          let pool: Node[] = [];
          let brCnt = 0;
          c.children.forEach((cc: Node, i) => {
            if (cc.type === 'element' && cc.tagName === 'br') {
              brCnt++;
            } else {
              if (brCnt === 0) {
                pool.push(cc);
              } else if (brCnt === 1) {
                pool.push((c.children as Node[])[i - 1]);
                pool.push(cc);
              } else {
                children.push({ ...c, children: pool });
                pool = [];
                pool.push(cc);
              }
            }
          });
          children.push({ ...c, children: pool });
        } else {
          children.push(c);
        }
      });
      tree.children = children;
    }
  };
}

export function removeBlankTransformer(): Transformer {
  return function transformer(tree: Node): void {
    if (tree.type === 'root' && Array.isArray(tree.children)) {
      tree.children.forEach((c: Node) => {
        if (
          c.type === 'element' &&
          c.tagName === 'p' &&
          Array.isArray(c.children)
        ) {
          const top = c.children.findIndex((v: Node) => {
            if (v.type === 'element' && v.tagName === 'br') {
              return false;
            }
            return true;
          });
          let bottom = c.children.length - 1;
          while (
            bottom >= 0 &&
            c.children[bottom].type === 'element' &&
            c.children[bottom].tagName === 'br'
          ) {
            bottom--;
          }
          c.children = c.children.slice(
            top >= 0 ? top : 0,
            bottom >= 0 ? bottom + 1 : c.children.length - 1
          );
          // console.log(c.children);
        }
      });
      tree.children = tree.children.filter((c: Node) => {
        return Array.isArray(c.children) && c.children.length > 0;
      });
    }
  };
}

export function codeDockHandler(
  h: (
    // エラーにならない程度に
    node: Element,
    type?: string,
    props?: string,
    children?: Element[]
  ) => Element,
  node: Element
): Element {
  if (isCodeDock(node)) {
    const b = (node.children[0] as Element).children[0] as Element;
    const kind = codeDockKind(b.value as string);
    const value = (b.value as string).replace(blockRegExp, '');
    switch (kind) {
      case 'markdown':
        return h(node, 'html', `\n${value}\n\n`);
      case 'comment':
        return h(node, 'html', toHtml({ type: 'comment', value }));
    }
  }
  return preHandler(h, node);
}

const htmlToMarkdownProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(splitParagraphTransformer)
  .use(removeBlankTransformer)
  .use(rehypeSanitize, { allowComments: true })
  .use(rehype2Remark, {
    handlers: { pre: codeDockHandler }
  })
  .use(stringify)
  .freeze();

const imageToMarkdownProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, { allowComments: true })
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

export async function sourceSetMarkdown(sourceSet: {
  sourceContents?: PagesSourcePageContents;
  sourcePages?: PagesSourcePages;
  source?: string;
}): Promise<string> {
  // 現状の deck API の スキーマだと sourcePages はセットされないが
  // いちおう残しておく。
  if (sourceSet.source) {
    return await pageHtmlMarkdown({
      fieldId: 'sourceHtml',
      html: sourceSet.source
    });
  } else if (sourceSet.sourceContents && sourceSet.sourceContents.length > 0) {
    return await pageMarkdown(sourceSet.sourceContents);
  } else if (sourceSet.sourcePages && sourceSet.sourcePages.length > 0) {
    return await pagesMarkdown(sourceSet.sourcePages);
  }
  return '';
}
