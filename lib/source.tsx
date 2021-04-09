import ReactDomServer from 'react-dom/server';
import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2Remark from 'rehype-remark';
import rehypeSanitize from 'rehype-sanitize';
import stringify from 'remark-stringify';
import { Transformer } from 'unified';
import { Node } from 'hast';
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
import { codeDockHandler } from './codedock';
import siteServerSideConfig from '../src/site.server-side-config';
import { qrcodeToDataUrl } from './qrcode';
var toText = require('hast-util-to-text');

export function splitParagraphTransformer(): Transformer {
  // 最上位の paragraph のみ対象。リストや引用、ネストは扱わない。
  return function transformer(tree: Node): void {
    // 連続 br
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
                brCnt = 0;
              } else {
                children.push({ ...c, children: pool });
                pool = [];
                pool.push(cc);
                brCnt = 0;
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
    // img
    if (tree.type === 'root' && Array.isArray(tree.children)) {
      const children: Node[] = [];
      tree.children.forEach((c: Node) => {
        if (
          c.type === 'element' &&
          c.tagName === 'p' &&
          Array.isArray(c.children)
        ) {
          let pool: Node[] = [];
          c.children.forEach((cc: Node, i) => {
            if (
              cc.type === 'element' &&
              cc.tagName === 'img' &&
              Array.isArray(c.children)
            ) {
              if (
                c.children[i - 1] &&
                c.children[i - 1].type === 'element' &&
                c.children[i - 1].tagName === 'br'
              ) {
                children.push({ ...c, children: pool }); // <br> が残るが他の transformer で除去している
                pool = [];
                pool.push(cc);
              } else if (
                c.children[i + 1] &&
                c.children[i + 1].type === 'element' &&
                c.children[i + 1].tagName === 'br'
              ) {
                pool.push(cc);
                children.push({ ...c, children: pool }); // <br> が残るが他の transformer で除去している
                pool = [];
              } else {
                pool.push(cc);
              }
            } else {
              pool.push(cc);
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
        }
      });
      tree.children = tree.children.filter((c: Node) => {
        return (
          Array.isArray(c.children) &&
          c.children.length > 0 &&
          !(c.type === 'element' && c.tagName === 'br')
        );
      });
    }
  };
}

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
  .use(splitParagraphTransformer)
  .use(removeBlankTransformer)
  .use(rehypeSanitize, { allowComments: true })
  .use(rehype2Remark, {
    //newlines: false,
    handlers: {
      pre: codeDockHandler,
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

export async function htmlToMarkdown(html: string): Promise<string> {
  const md = await pageHtmlMarkdown({
    fieldId: 'sourceHtml',
    html
  });
  // console.log(md);
  // return md;
  // console.log(await qrcodeToDataUrl(md));
  return await qrcodeToDataUrl(md);
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
