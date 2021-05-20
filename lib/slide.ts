import {
  createWriteStream,
  copyFileSync,
  mkdirSync,
  writeFileSync,
  statSync
} from 'fs';
// import { access, constants } from 'fs/promises';
import { spawn } from 'child_process';
import { join, format } from 'path';
import { Writable, PassThrough } from 'stream';
import { createHash } from 'crypto';
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
import { metaDeck } from './meta';
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
export const slidePublicImageExt = 'png';
export const slidePublicPdfExt = 'pdf';
export const slidePublicPptxExt = 'pptx';
export function getSlideCachePath(id: string, cacheKey: string): string {
  return join(basePath, siteServerSideConfig.caches.deck, id, cacheKey);
}
export function getSlideCacheFilePath(
  id: string,
  cacheKey: string,
  name: string
): string {
  return join(getSlideCachePath(id, cacheKey), name);
}
export function getSlideAssetsPath(id: string, cacheKey: string): string {
  return join(basePath, siteServerSideConfig.assets.deck, id, cacheKey);
}
export function getSlideAssetsFilePath(
  id: string,
  cacheKey: string,
  name: string
): string {
  return join(getSlideAssetsPath(id, cacheKey), name);
}
export function getSlidePublicPath(id: string, cacheKey: string): string {
  return join(siteServerSideConfig.public.deck, id, cacheKey);
}
export function getSlidePublicFilePath(
  id: string,
  cacheKey: string,
  name: string
): string {
  return join(getSlidePublicPath(id, cacheKey), name);
}
export function getSlidePublicImageFilename(id: string): string {
  return format({
    name: id,
    ext: `.${slidePublicImageExt}`
  });
}
export function getSlidePublicPdfFilename(id: string): string {
  return format({
    name: id,
    ext: `.${slidePublicPdfExt}`
  });
}
export function getSlidePublicPptxFilename(id: string): string {
  return format({
    name: id,
    ext: `.${slidePublicPptxExt}`
  });
}

export function slideCacheSetup(id: string, cacheKey: string): boolean {
  try {
    mkdirSync(getSlideAssetsPath(id, ''));
  } catch (_err) {}
  try {
    mkdirSync(getSlideAssetsPath(id, cacheKey));
  } catch (_err) {}

  const cachePath = getSlideCachePath(id, '');
  try {
    mkdirSync(cachePath);
  } catch (_err) {}
  let path = getSlideCachePath(id, cacheKey);
  try {
    mkdirSync(path);
    writeFileSync(join(cachePath, 'latest'), cacheKey);
  } catch (err) {
    // 作成できなかったときは既に存在していると仮定.
    // TODO: エラーの内容チェック.
    path = '';
  }
  console.log(`Cache path: ${id} ${path === ''}`);
  return path !== '';
}

// console.log(basePath);
const marpPath = join(basePath, 'node_modules', '.bin', 'marp');

export function slideHtml(markdown: string, w: Writable): Promise<number> {
  // とりあえず。
  return new Promise((resolve, reject) => {
    let errMsg = '';
    const marpP = spawn(marpPath, ['--html']);
    if (marpP && marpP.stdout) {
      marpP.stdout.pipe(w);
    }
    if (marpP && marpP.stderr) {
      marpP.stderr.on('data', (d) => {
        errMsg = errMsg + d.toString('utf8');
      });
    }
    marpP.on('close', (code) => {
      if (code === 0 && errMsg.match(/^\[ ERROR \] /m) === null) {
        resolve(code);
      } else {
        reject(`slideHtml error: code: ${code} err: ${errMsg}`);
      }
    });
    if (marpP && marpP.stdin) {
      marpP.stdin.write(markdown);
      marpP.stdin.end();
    }
  });
}

export function slideCopyCacheToAssets(
  id: string, // コンテンツの id
  cacheKey: string, // 通常は HTML 化したときの hash
  fileName: string // 拡張子きのファイル名(通常は id+拡張子)
): Error | null {
  let ret: Error | null = null;
  const srcPath = getSlideCacheFilePath(id, cacheKey, fileName);
  const dstPath = getSlideAssetsFilePath(id, cacheKey, fileName);
  try {
    copyFileSync(srcPath, dstPath);
    if (statSync(dstPath).size === 0) {
      ret = new Error(`slideCopyCacheToAssets error: size of ${fileName} is 0`);
    }
  } catch (err) {
    ret = err;
    // console.error(err);
  }
  return ret;
}

export async function slideVariantFile(
  id: string, // コンテンツの id
  cacheKey: string, // 通常は HTML 化したときの hash
  markdown: string,
  fileName: string, // 拡張子きのファイル名(通常は id+拡張子)
  formatOpts: string[] = ['--image', slidePublicImageExt, '--html'],
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  const w = createWriteStream(getSlideCacheFilePath(id, cacheKey, fileName), {
    flags: 'wx',
    encoding: 'binary'
  });
  w.on('error', () => {
    // 'wx' で上書き失敗したときのエラー
  });
  let errMsg = '';
  const ret: number = await new Promise((resolve, reject) => {
    const marpP = spawn(marpPath, formatOpts);
    if (marpP && marpP.stdout) {
      marpP.stdout.setEncoding(options.encoding || 'binary');
      marpP.stdout.pipe(w);
    }
    if (marpP && marpP.stderr) {
      marpP.stderr.on('data', (d) => {
        errMsg = errMsg + d.toString('utf8');
      });
    }
    marpP.on('close', (code) => {
      if (code === 0 && errMsg.match(/^\[ ERROR \] /m) === null) {
        resolve(code);
      } else {
        reject(`slideVariantFile error: code: ${code} err: ${errMsg}`);
      }
    });
    if (marpP && marpP.stdin) {
      marpP.stdin.write(markdown);
      marpP.stdin.end();
    }
  });
  w.close();
  slideCopyCacheToAssets(id, cacheKey, fileName);
  return ret;
}

export async function slideImage(
  id: string,
  cacheKey: string,
  markdown: string,
  fileName: string,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  return await slideVariantFile(
    id,
    cacheKey,
    markdown,
    fileName,
    ['--image', slidePublicImageExt, '--html'],
    options
  ).catch((err) => {
    throw new Error(`slideImage error: ${err}`);
  });
}

export async function slidePdf(
  id: string,
  cacheKey: string,
  markdown: string,
  fileName: string,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  return await slideVariantFile(
    id,
    cacheKey,
    markdown,
    fileName,
    ['--pdf', '--html'],
    options
  ).catch((err) => {
    throw new Error(`slidePdf error: ${err}`);
  });
}

export async function slidePptx(
  id: string,
  cacheKey: string,
  markdown: string,
  fileName: string,
  options: { encoding?: string } = { encoding: 'binary' }
): Promise<number> {
  return await slideVariantFile(
    id,
    cacheKey,
    markdown,
    fileName,
    ['--pptx', '--html'],
    options
  ).catch((err) => {
    throw new Error(`slidePptx error: ${err}`);
  });
}

export async function writeSlideTitleImage(
  needWrite: boolean,
  id: string,
  cacheKey: string,
  source: string
): Promise<PagesImage> {
  const ret: PagesImage = {
    url: getSlidePublicFilePath(id, cacheKey, getSlidePublicImageFilename(id)),
    width: 1280,
    height: 720
  };
  // const p = getSlideImagePath(getSlidePublicImageFilename(id));
  if (needWrite) {
    const res = await slideImage(
      id,
      cacheKey,
      source,
      getSlidePublicImageFilename(id)
    );
    if (res !== 0) {
      // コマンド実行が失敗したのでテンポラリ画像(chrome が無い環境だと失敗する)
      ret.url = siteServerSideConfig.slide.fallbackImage.url;
      ret.width = siteServerSideConfig.slide.fallbackImage.width;
      ret.height = siteServerSideConfig.slide.fallbackImage.height;
    }
  } else {
    const err = slideCopyCacheToAssets(
      id,
      cacheKey,
      getSlidePublicImageFilename(id)
    );
    if (err) {
      throw err;
    }
  }
  return ret;
}

export async function writeSlidePdf(
  needWrite: boolean,
  id: string,
  cacheKey: string,
  source: string
): Promise<string> {
  let ret = getSlidePublicFilePath(id, cacheKey, getSlidePublicPdfFilename(id));
  // const p = getSlidePdfPath(getSlidePublicPdfFilename(id));
  if (needWrite) {
    const res = await slidePdf(
      id,
      cacheKey,
      source,
      getSlidePublicPdfFilename(id)
    );
    if (res !== 0) {
      ret = '';
    }
  } else {
    if (
      slideCopyCacheToAssets(id, cacheKey, getSlidePublicPdfFilename(id)) !==
      null
    ) {
      ret = '';
    }
  }
  return ret;
}

export async function writeSlidePptx(
  needWrite: boolean,
  id: string,
  cacheKey: string,
  source: string
): Promise<string> {
  let ret = getSlidePublicFilePath(
    id,
    cacheKey,
    getSlidePublicPptxFilename(id)
  );
  // const p = getSlidePptxPath(getSlidePublicPptxFilename(id));
  if (needWrite) {
    const res = await slidePptx(
      id,
      cacheKey,
      source,
      getSlidePublicPptxFilename(id)
    );
    if (res !== 0) {
      ret = '';
    }
  } else {
    if (
      slideCopyCacheToAssets(id, cacheKey, getSlidePublicPdfFilename(id)) !==
      null
    ) {
      ret = '';
    }
  }
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
      source,
      meta: {},
      hash: ''
    };
  }
  return blankDeckData();
}

export async function slideDeckSlide(
  id: string,
  source: string
): Promise<DeckData> {
  const containerId = `slide-${id}`;
  const marp = new Marp({
    inlineSVG: true,
    html: true,
    container: [
      new Element('article', { id: containerId }),
      new Element('div', { class: 'slides' }),
      new Element('div'),
      new Element('div'),
      new Element('div')
    ],
    slideContainer: new Element('div', { class: 'slideDeck' }),
    script: false
  });
  const ret = await _slideDeck(marp, containerId, source);
  ret.meta = metaDeck(source).data; // ここではエラーは無視する(プレビューモードで検証する)
  const hash = createHash('sha256');
  ret.hash = hash.update(JSON.stringify(ret), 'utf8').digest().toString('hex');
  return ret;
}
export async function slideDeckIndex(
  id: string,
  source: string
): Promise<DeckData> {
  const containerId = `slide-${id}`;
  const marp = new Marp({
    inlineSVG: true,
    html: true,
    container: [
      new Element('article', { id: containerId }),
      new Element('div', { class: 'slides' }),
      new Element('div'),
      new Element('div'),
      new Element('div'),
      new Element('a')
    ],
    slideContainer: new Element('div', { class: 'slideDeck' }),
    script: false
  });
  const ret = await _slideDeck(marp, containerId, source);
  ret.meta = metaDeck(source).data; // ここではエラーは無視する(プレビューモードで検証する)
  return ret;
}

export async function slideDeckOverview(
  id: string,
  source: string
): Promise<DeckData> {
  const containerId = `overview-${id}`;
  const marp = new Marp({
    inlineSVG: true,
    html: true,
    container: [
      new Element('article', { id: containerId }),
      new Element('div', { class: 'slides' }),
      new Element('ul'),
      new Element('li'),
      new Element('div'),
      new Element('button')
    ],
    slideContainer: [new Element('div', { class: 'slide' })],
    script: false
  });
  return await _slideDeck(marp, containerId, source);
}

export async function getSlideData(source: string): Promise<SlideData> {
  let html = '';
  const s = new PassThrough();
  s.on('data', (d) => {
    html = html + d;
  });
  await slideHtml(source, s).catch((err) => {
    throw new Error(`getSlideData error:${err}`);
  });
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
