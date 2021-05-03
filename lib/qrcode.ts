import fromMarkdown from 'mdast-util-from-markdown';
import toMarkdown from 'mdast-util-to-markdown';
import { toImageDataURL } from 'mdast-qrcode';

export async function qrcodeToDataUrl(markdown: string): Promise<string> {
  // FrontMatter は処理しないので注意(mardock では --- の前後に空行で対応)
  const tree = fromMarkdown(markdown);
  // markdown のノーマライズがここで行われる形になっている.
  return toMarkdown(await toImageDataURL(tree), { bullet: '-', rule: '-' });
}
