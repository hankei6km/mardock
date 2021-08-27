import unified from 'unified';
import markdown from 'remark-parse';
import highlight from 'remark-highlight.js';
import gfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';
import { externalLinkTransformer } from './html';
import fromMarkdown from 'mdast-util-from-markdown';
import toMarkdown from 'mdast-util-to-markdown';
import { toImageDataURL as qrcodeToImageDataURL } from 'mdast-qrcode';
import { toImageDataURL as avatarToImageDataURL } from 'mdast-avatar';

export function processorMarkdownToHtml() {
  return unified()
    .use(markdown)
    .use(highlight)
    .use(gfm)
    .use(remark2rehype, { allowDangerousHtml: true })
    .use(externalLinkTransformer)
    .use(raw);
}

export async function editMarkdown(markdown: string): Promise<string> {
  // FrontMatter は処理しないので注意(mardock では --- の前後に空行で対応)
  const tree = fromMarkdown(markdown);
  // markdown のノーマライズがここで行われる形になっている.
  return toMarkdown(
    await qrcodeToImageDataURL(tree).then((tree) => avatarToImageDataURL(tree)),
    {
      bullet: '-',
      rule: '-'
    }
  );
}
