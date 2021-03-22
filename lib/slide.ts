import { createWriteStream } from 'fs';
import { execFile } from 'child_process';
import { join, dirname } from 'path';
import { Writable } from 'stream';
import cheerio from 'cheerio';
import { SlideData, blankSlideData } from '../types/pageTypes';
// temp ファイル、fifo 等も考えたが今回は pipe で楽する。
// 速度的に不利になったら考える。
// import { marpCli } from '@marp-team/marp-cli';

//https://stackoverflow.com/questions/10111163/in-node-js-how-can-i-get-the-path-of-a-module-i-have-loaded-via-require-that-is
const basePath = dirname(
  dirname(dirname(dirname(dirname(require.resolve('@marp-team/marp-cli')))))
);
// console.log(basePath);
const marpPath = join(basePath, 'node_modules', '.bin', 'marp');

export function slideHtml(markdown: string, w: Writable): Promise<number> {
  // とりあえず。
  return new Promise((resolve) => {
    // spawn で stdout.pipe を使うと後ろのデータがドロップしてしまう
    // (GitHub Actions のときに 8 割りくらい確率で)
    // しかたないので stdout の内容をべたで扱う.
    const marpP = execFile(marpPath, [], (err, stdout, _strderr) => {
      if (err) {
        throw new Error(`slideHtml error: ${err}`);
      }
      w.write(stdout);
      resolve(0);
    });
    if (marpP && marpP.stdin) {
      marpP.stdin.write(markdown);
      marpP.stdin.end();
    }
  });
  //marpCli(['./slides/slide-deck.md', '-o', './dist/index.html'])
  //  .then((exitStatus) => {
  //    if (exitStatus > 0) {
  //      console.error(`Failure (Exit status: ${exitStatus})`);
  //    } else {
  //      console.log('Success');
  //    }
  //  })
  //  .catch(console.error);
}

export async function slideWriteHtmlTo(
  markdown: string,
  slidePathHtml: string
): Promise<{}> {
  const w = createWriteStream(join('public', slidePathHtml));
  await slideHtml(markdown, w);
  // TOC を返すようにする予定(たぶん).
  return {};
}

export async function getSlideData(source: string): Promise<SlideData> {
  let html = '';
  const s = new Writable({
    write(data) {
      html = html + data.toString();
    }
  });
  await slideHtml(source, s);
  // test で実行したときで 64659 となるので、
  // (style やら script ご殆どだろうから)普通に使っている分にはそれほど増えないかな。
  // console.log(html.length);

  const ret = blankSlideData();
  const $ = cheerio.load(html);
  $('head')
    .children()
    .each((_idx, elm) => {
      if (elm.type === 'tag') {
        const attribs = elm.attribs ? { ...elm.attribs } : {};
        if (elm.attribs.class) {
          attribs.className = elm.attribs.class;
          delete attribs.class;
        }
        ret.head.push({
          tagName: elm.tagName,
          attribs: attribs,
          html: $(elm).html() || ''
        });
      } else if ((elm.type as any) === 'style') {
        if ((elm as any).children) {
          (elm as any).children.forEach((c: any) => {
            ret.head.push({
              tagName: 'style',
              attribs: {},
              html: c.data || ''
            });
          });
        }
      }
    });
  $('body')
    .children()
    .each((_idx, elm) => {
      if (elm.type === 'tag') {
        const attribs = elm.attribs ? { ...elm.attribs } : {};
        // if (elm.attribs.class) {
        //   attribs.className = elm.attribs.class;
        //   delete attribs.class;
        // }
        ret.body.push({
          tagName: elm.tagName,
          attribs: attribs,
          html: $(elm).html() || ''
        });
      } else if ((elm.type as any) === 'script') {
        if ((elm as any).children) {
          (elm as any).children.forEach((c: any) => {
            ret.body.push({
              tagName: 'script',
              attribs: {},
              html: c.data || ''
            });
          });
        }
      }
    });
  return ret;
}
