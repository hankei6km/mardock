import { createWriteStream } from 'fs';
// import { access, constants } from 'fs/promises';
import { spawn, execFile } from 'child_process';
import { join } from 'path';
import { Writable } from 'stream';
import Marp from '@marp-team/marp-core';
import cheerio from 'cheerio';
import siteServerSideConfig from '../src/site.server-side-config';
import {
  SlideData,
  blankSlideData,
  DeckData,
  blankDeckData
} from '../types/pageTypes';
import { PagesImage } from '../types/client/contentTypes';
import themes from '../src/marp-theme';
// import qrcode from '../src/markdown-it-qrcode';
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
  return join(basePath, siteServerSideConfig.assets.imagesPath, name);
}
export function getSlidePublicImagePath(name: string): string {
  return join(siteServerSideConfig.public.imagesPath, name);
}
export function getSlidePdfPath(name: string): string {
  return join(basePath, siteServerSideConfig.assets.pdfPath, name);
}
export function getSlidePublicPdfPath(name: string): string {
  return join(siteServerSideConfig.public.pdfPath, name);
}
export function getSlidePptxPath(name: string): string {
  return join(basePath, siteServerSideConfig.assets.pptxPath, name);
}
export function getSlidePublicPptxPath(name: string): string {
  return join(siteServerSideConfig.public.pptxPath, name);
}

// console.log(basePath);
const marpPath = join(basePath, 'node_modules', '.bin', 'marp');

export function slideHtml(markdown: string, w: Writable): Promise<number> {
  // とりあえず。
  return new Promise((resolve) => {
    // spawn で stdout.pipe を使うと後ろのデータがドロップしてしまう
    // (GitHub Actions のときに 8 割りくらい確率で)
    // しかたないので stdout の内容をべたで扱う.
    // image と pdf の書き出しだとドロップしない?
    const marpP = execFile(marpPath, ['--html'], (err, stdout, _strderr) => {
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
}

export function slideVariantFile(
  markdown: string,
  w: Writable,
  formatOpts: string[] = ['--image', 'png', '--html'],
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  // とりあえず。
  return new Promise((resolve) => {
    const marpP = spawn(marpPath, formatOpts);
    if (marpP && marpP.stdout) {
      // marpP.stdout.setEncoding('base64');
      marpP.stdout.setEncoding(options.encoding || 'binary');
      marpP.stdout.on('data', (data) => {
        w.write(data);
      });
    }
    marpP.on('close', (code) => {
      resolve(code);
    });
    if (marpP && marpP.stdin) {
      marpP.stdin.write(markdown);
      marpP.stdin.end();
    }
  });
}

export async function slideImage(
  markdown: string,
  w: Writable,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  return await slideVariantFile(
    markdown,
    w,
    ['--image', 'png', '--html'],
    options
  );
}

export async function slidePdf(
  markdown: string,
  w: Writable,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  // とりあえず。
  return await slideVariantFile(markdown, w, ['--pdf', '--html'], options);
}

export async function slidePptx(
  markdown: string,
  w: Writable,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  // とりあえず。
  return await slideVariantFile(markdown, w, ['--pptx', '--html'], options);
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
    url: getSlidePublicImagePath(`${id}.png`),
    width: 1280,
    height: 720
  };
  const p = getSlideImagePath(`${id}.png`);
  const w = createWriteStream(p, { flags: 'wx', encoding: 'binary' });
  w.on('error', () => {
    // 'wx' で上書き失敗したときのエラー
  });
  const res = await slideImage(source, w).catch((err) => console.log(err));
  if (res !== 0) {
    // コマンド実行が失敗したのでテンポラリ画像(chrome が無い環境だと失敗する)
    ret.url = siteServerSideConfig.slide.fallbackImage.url;
    ret.width = siteServerSideConfig.slide.fallbackImage.width;
    ret.height = siteServerSideConfig.slide.fallbackImage.height;
  }
  w.close();
  return ret;
}

export async function writeSlidePdf(
  source: string,
  id: string
): Promise<string> {
  let ret = getSlidePublicPdfPath(`${id}.pdf`);
  const p = getSlidePdfPath(`${id}.pdf`);
  const w = createWriteStream(p, { flags: 'wx', encoding: 'binary' });
  w.on('error', () => {
    // 'wx' で上書き失敗したときのエラー
  });
  const res = await slidePdf(source, w).catch(() => {});
  if (res !== 0) {
    ret = '';
  }
  w.close();
  return ret;
}

export async function writeSlidePptx(
  source: string,
  id: string
): Promise<string> {
  let ret = getSlidePublicPptxPath(`${id}.pptx`);
  const p = getSlidePptxPath(`${id}.pptx`);
  const w = createWriteStream(p, { flags: 'wx', encoding: 'binary' });
  w.on('error', () => {
    // 'wx' で上書き失敗したときのエラー
  });
  const res = await slidePptx(source, w).catch(() => {});
  if (res !== 0) {
    ret = '';
  }
  w.close();
  return ret;
}

export function slideDeckRemoveId(html: string): string {
  const $ = cheerio.load(html);
  // $('svg > foreignObject > section').removeAttr('id');
  $('svg > * > section').removeAttr('id');
  return $('body').html() || '';
}

export async function _slideDeck(
  marp: Marp,
  id: string,
  source: string
): Promise<DeckData> {
  if (source) {
    themes.forEach((t) => marp.themeSet.add(t));
    const { html, css } = marp.render(source, { htmlAsArray: true });
    // array を指定すると script が取得できない
    // 以下、とりあすの対応.
    // slideData と共通化するか?:
    // 一旦停止。
    // - 同じスクリプトが何度も読み込まれる。
    // - listner がリークしている可能性(きちんと調べていない)を考慮しなるべく動的には扱わない
    // Layout の方で observer を読み込んでいる(ダメだったらこちらに戻す:)
    //const t = marp.render(source);
    //const script: string[] = [];
    //const $ = cheerio.load(t.html);
    //$('script').each((_idx, elm) => {
    //  script.push($(elm).html() || '');
    //});
    // iframe  を使う方がよいか？:
    const script: string[] = [];
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
      id,
      minX,
      minY,
      width,
      height,
      css,
      script,
      items: html.map((v) => ({
        html: v
      })),
      source
    };
  }
  return blankDeckData();
}

export async function slideDeck(id: string, source: string): Promise<DeckData> {
  const containerId = `slide-${id}`;
  const marp = new Marp({
    inlineSVG: true,
    html: true,
    container: [
      new Element('article', { id: containerId }),
      new Element('div', { class: 'slides' })
    ],
    slideContainer: new Element('div', { class: 'slide' }),
    script: false
  });
  return await _slideDeck(marp, containerId, source);
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
        // fitting の script は取り込まれない.
        // Layout の方で observer を読み込んでいる(ダメだった下記のコメントアウトの方に戻す:)
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
  // $('script').each((_idx, elm) => {
  //   ret.body.push({
  //     tagName: 'script',
  //     attribs: {},
  //     html: $(elm).html() || ''
  //   });
  // });
  return ret;
}
