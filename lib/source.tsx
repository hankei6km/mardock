import ReactDomServer from 'react-dom/server';
import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2Remark from 'rehype-remark';
import rehypeSanitize from 'rehype-sanitize';
import stringify from 'remark-stringify';
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

const htmlToMarkdownProcessor = unified()
  .use(rehypeParse)
  .use(rehypeSanitize)
  .use(rehype2Remark)
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
          // const markdown = `${file}`;
          // とりあえず暫定で改ページさせる
          const markdown = `${file}`.replace(/\\---/g, '---');
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
    htmlToMarkdownProcessor.process(
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
  sourcePages?: PagesSourcePages;
  source?: string;
}): Promise<string> {
  if (sourceSet.source) {
    return sourceSet.source;
  } else if (sourceSet.sourcePages && sourceSet.sourcePages.length > 0) {
    return await pagesMarkdown(sourceSet.sourcePages);
  }
  return '';
}
