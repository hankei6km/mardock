import { createWriteStream } from 'fs';
// import { access, constants } from 'fs/promises';
import { execFile } from 'child_process';
import { join } from 'path';
import { Writable } from 'stream';
import Marp from '@marp-team/marp-core';
import cheerio from 'cheerio';
import { SlideData, blankSlideData, DeckData } from '../types/pageTypes';
import { PagesImage } from '../types/client/contentTypes';
const { Element } = require('@marp-team/marpit');
// temp ファイル、fifo 等も考えたが今回は pipe で楽する。
// 速度的に不利になったら考える。
// import { marpCli } from '@marp-team/marp-cli';

//https://stackoverflow.com/questions/10111163/in-node-js-how-can-i-get-the-path-of-a-module-i-have-loaded-via-require-that-is
// const basePath = dirname(
//   dirname(dirname(require.resolve('@marp-team/marp-cli')))
// );
// 上記方法だと絶対パスになっていなかった(勘違いか?)
// とりあえず相対パス:
// TODO: 絶対パスで取得
const basePath = '.';
export function getSlideImagePath(name: string): string {
  return join(basePath, 'public', 'assets', 'images', name);
}
export function getSlideImageAbsPath(name: string): string {
  return join('/', 'assets', 'images', name);
}

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

export function slideImage(
  markdown: string,
  w: Writable,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  // とりあえず。
  return new Promise((resolve) => {
    const marpP = execFile(
      marpPath,
      ['--image', 'png'],
      (err, stdout, _stderr) => {
        if (err) {
          // throw new Error(`slideHtml error: ${err}`);
          resolve(1);
          return;
        }
        // TODO: どうにかして stream にできないか？
        w.write(stdout);
        resolve(0);
      }
    );
    if (marpP && marpP.stdin) {
      marpP.stdin.write(markdown);
      marpP.stdin.end();
    }
    if (marpP && marpP.stdout) {
      // marpP.stdout.setEncoding('base64');
      marpP.stdout.setEncoding(options.encoding || 'binary');
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

export async function writeSlideTitleImage(
  source: string,
  id: string
): Promise<PagesImage> {
  const ret: PagesImage = {
    url: getSlideImageAbsPath(`${id}.png`),
    width: 1280,
    height: 720
  };
  const p = getSlideImagePath(`${id}.png`);
  const w = createWriteStream(p, { flags: 'wx', encoding: 'binary' });
  w.on('error', () => {
    // 'wx' で上書き失敗したときのエラー
  });
  const res = await slideImage(source, w).catch(() => {});
  if (res !== 0) {
    // コマンド実行が失敗したのでテンポラリ画像(chrome が無い環境だと失敗する)
    ret.url =
      'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/eb84db7f1a7a4409bd20ffc27abe60e4/mardock-temp-image.png';
    ret.width = 1280;
    ret.height = 720;
  }
  w.close();
  return ret;
}

export async function slideDeck(source: string): Promise<DeckData> {
  const marp = new Marp({
    container: [
      new Element('article', { id: 'presentation' }),
      new Element('div', { class: 'slides' })
    ],
    slideContainer: new Element('div', { class: 'slide' })
  });
  const { html, css } = marp.render(source, { htmlAsArray: true });
  let minX = 0;
  let minY = 0;
  let width = 0;
  let height = 0;
  if (html.length > 0) {
    const marpItSvg = cheerio.load(html[0])('svg');
    const a = marpItSvg.attr('viewBox')?.split(' ');
    if (a && a.length === 4) {
      minX = parseInt(a[0], 10);
      minY = parseInt(a[1], 10);
      width = parseInt(a[2], 10);
      height = parseInt(a[3], 10);
    }
  }
  return {
    minX,
    minY,
    width,
    height,
    css,
    items: html.map((v) => ({
      html: v
    }))
  };
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
