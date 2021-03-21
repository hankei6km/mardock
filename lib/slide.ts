import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { Writable } from 'stream';
import cheerio from 'cheerio';
import { SlideData, blankSlideData } from '../types/pageTypes';
// temp ファイル、fifo 等も考えたが今回は pipe で楽する。
// 速度的に不利になったら考える。
// import { marpCli } from '@marp-team/marp-cli';

const basePath = dirname(dirname(dirname(process.argv[1])));

export function slidePathBaseName(id: string): string {
  return join('/', 'slides', id);
}

export function slideHtml(markdown: string, w: Writable): Promise<number> {
  // とりあえず。
  // writable として実装しておいた方が楽かな
  return new Promise((resolve) => {
    const marpPath = join(basePath, 'node_modules', '.bin', 'marp');
    let e = '';
    const marpP = spawn(marpPath, []);
    marpP.stdout.pipe(w);
    marpP.stderr.on('data', (data) => {
      e = e + data.toString('utf8');
    });
    marpP.on('close', (code) => {
      resolve(code);
      if (code !== 0) {
        throw new Error(`slideHtml error: ${e}`);
      }
    });
    marpP.stdin.write(markdown);
    marpP.stdin.end();
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
  const w = createWriteStream(join(basePath, 'public', slidePathHtml));
  await slideHtml(markdown, w);
  // TOC を返すようにする予定(たぶん).
  return {};
}

export async function getSlideData(source: string): Promise<SlideData> {
  let html = '';
  const s = new Writable({
    write(data) {
      html = html + data;
    }
  });
  await slideHtml(source, s);

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
  // $('script').each((_idx, elm) => {
  // });
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
