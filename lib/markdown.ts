import unified from 'unified';
import markdown from 'remark-parse';
import highlight from 'remark-highlight.js';
import gfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';

export function processorMarkdownToHtml() {
  return unified()
    .use(markdown)
    .use(highlight)
    .use(gfm)
    .use(remark2rehype, { allowDangerousHtml: true })
    .use(raw);
}
