import fromMarkdown from 'mdast-util-from-markdown';
import toMarkdown from 'mdast-util-to-markdown';
import { Node as MdNode } from 'unist';
//const QRCode = require('qrcode');
import QRCode from 'qrcode';

async function transformer(tree: MdNode): Promise<void> {
  if (tree.type === 'root' && Array.isArray(tree.children)) {
    const l = tree.children.length;
    for (let i = 0; i < l; i++) {
      const c = tree.children[i];
      if (c.type === 'paragraph' && Array.isArray(c.children)) {
        const ll = c.children.length;
        for (let ii = 0; ii < ll; ii++) {
          const cc = c.children[ii];
          //console.log(cc.type);
          if (cc.type === 'image') {
            if (cc.url.startsWith('qrcode:')) {
              const text = cc.url.slice(7); // 'qrcode:'.length = 7
              const d = await QRCode.toDataURL(text);
              cc.url = d;
            }
          }
        }
      }
    }
  }
}

export async function qrcodeToDataUrl(markdown: string): Promise<string> {
  const tree = fromMarkdown(markdown);
  await transformer(tree);
  // markdown のノーマライズがここで行われる形になっている.
  return toMarkdown(tree, { bullet:'-', rule: '-' });
}
