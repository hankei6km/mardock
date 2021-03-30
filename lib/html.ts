import unified, { Processor, FrozenProcessor } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeMinifyWhitespace from 'rehype-minify-whitespace';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import merge from 'deepmerge';
import gh from 'hast-util-sanitize/lib/github.json';
import { Schema } from 'hast-util-sanitize';
import cheerio from 'cheerio';
import { TocItems, HtmlToc } from '../types/pageTypes';
import { processorMarkdownToHtml } from './markdown';

export function processorHtml() {
  return unified().use(rehypeParse, { fragment: true });
}

const schema = merge(gh, {
  tagNames: ['picture', 'source', 'iframe'],
  attributes: {
    source: ['srcSet', 'sizes'],
    img: ['alt', 'srcSet', 'sizes', 'className'],
    code: ['className'],
    span: ['className','style'],
    iframe: [
      'height',
      'style',
      'scrolling',
      'title',
      'src',
      'frameborder',
      'loading',
      'allowtransparency',
      'allowfullscreen'
    ]
  }
});

function normalizeProcessor(processor: Processor): FrozenProcessor {
  return processor
    .use(rehypeMinifyWhitespace)
    .use(rehypeSanitize, (schema as unknown) as Schema)
    .use(rehypeStringify)
    .freeze();
}

export async function normalizedHtml(
  processor: Processor,
  html: string
): Promise<string> {
  return await new Promise((resolve, reject) => {
    normalizeProcessor(processor).process(html, (err, file) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(String(file));
    });
  });
}

export function splitStrToParagraph($: cheerio.Root): string {
  $('body')
    .children()
    .each((_idx, elm) => {
      if (elm.type === 'tag' && elm.tagName === 'p') {
        const $elm = $(elm);
        let $p = cheerio.load('<p></p>')('p');
        const $pArray: typeof $p[] = [];
        let brCnt = 0;
        const $contents = $elm.contents();
        $contents.each((idx, e) => {
          if (e.type === 'tag' && e.tagName === 'br') {
            // <br> を数える
            brCnt++;
          } else {
            if (brCnt === 1) {
              // <br> が１つだけあったので、そのまま追加
              $p.append($contents.get(idx - 1));
            } else if (brCnt >= 2) {
              // <br> が複数存在していたので <p> として分割
              $pArray.push($p);
              $p = cheerio.load('<p></p>')('p');
            }
            $p.append($(e));
            brCnt = 0;
          }
        });
        $pArray.push($p);
        $elm.replaceWith(
          $pArray
            .filter(($p) => $p.contents().length > 0)
            .map(($p) => $p.parent().html())
            .join('')
        );
      }
    });
  return $('body').html() || '';
}

const textToTocLabelRegExp = /[#.()[\]{}<>@&%$"`=_:;'\\ \t\n\r]/g;
export function getTocLabel(s: string): string {
  // selector ではそのままで使えない id になる可能性もある
  // CSS.escape() は "selector 内で operator? になる文字をエスケープ"するものなので
  // ちょっと意味合いが違う
  return s.replace(textToTocLabelRegExp, '-');
}

const headingToNumberRegExp = /h(\d+)/;
export function headingToNumber(tagName: string): number {
  const n = parseInt(tagName.replace(headingToNumberRegExp, '$1'), 10);
  return isNaN(n) ? -1 : n;
}

function _adjustHeading($: cheerio.Root, h: number) {
  const headding = `h${h}`;
  const slided = `h${h + 1}`;
  $(headding).each((_idx, $elm) => {
    if ($elm.type === 'tag' && $elm.tagName === headding) {
      $elm.tagName = slided;
      // とりあえず 空白と tab 改行は - にしておく.
      // https://developer.mozilla.org/ja/docs/Web/HTML/Global_attributes/id
      //> この制約は HTML5 で外されましたが、互換性のために ID は文字で始めるようにしましょう。
      // prefix は sanitize で付加される.
      // 問題になるようなら hash 化する
      // (hashs は notification 用があるので、それを util にする).
      const elm = $($elm);
      elm.attr('id', getTocLabel(elm.text()));
    }
  });
}

export function adjustHeading($: cheerio.Root) {
  _adjustHeading($, 5);
  _adjustHeading($, 4);
  _adjustHeading($, 3);
  _adjustHeading($, 2);
  _adjustHeading($, 1);
}

export function htmlToc(
  $: cheerio.Root,
  root: TocItems = [],
  opts: { top: number; depth: number } = { top: 3, depth: 1 }
): TocItems {
  const ret: TocItems = [...root];
  let items: TocItems = ret;
  const path: TocItems[] = [items];
  let prevDepth = ret.length > 0 ? ret[0].depth : 0;

  $(`h${opts.top},h${opts.top + 1}`).each((_idx, $heading) => {
    const heading = $($heading);
    const depth =
      opts.depth +
      (headingToNumber($heading.type === 'tag' ? $heading.tagName : '') -
        opts.top);
    const item = {
      label: getTocLabel(heading.text()),
      items: [],
      depth,
      id: heading.attr('id') || ''
    };
    if (prevDepth < depth) {
      if (items.length > 0) {
        path.push(items);
        items = items[items.length - 1].items;
      }
    } else if (depth < prevDepth) {
      items = path.pop() || [];
    }
    items.push(item);
    prevDepth = depth;
  });

  return ret;
}

export function getArticleData(
  title: string,
  html: string
): {
  articleTitle: string;
  htmlToc: HtmlToc;
  html: string;
} {
  const $ = cheerio.load(html);
  splitStrToParagraph($);
  const h1 = $('body h1:first');
  if (h1.length === 0) {
    adjustHeading($);
    return {
      articleTitle: title,
      htmlToc: {
        items: htmlToc($)
      },
      html: $('body').html() || ''
    };
  }
  h1.remove();
  adjustHeading($);
  return {
    articleTitle: $(h1[0]).html() || '',
    htmlToc: {
      items: htmlToc($)
    },
    html: $('body').html() || ''
  };
}

export async function getArticleDataFromContent(
  title: string,
  content: string
): Promise<{
  articleTitle: string;
  htmlToc: HtmlToc;
  html: string;
}> {
  const $ = cheerio.load(
    await normalizedHtml(processorMarkdownToHtml(), content)
  );
  splitStrToParagraph($);
  const h1 = $('body h1:first');
  if (h1.length === 0) {
    adjustHeading($);
    return {
      articleTitle: title,
      htmlToc: {
        items: htmlToc($)
      },
      html: $('body').html() || ''
    };
  }
  h1.remove();
  adjustHeading($);
  return {
    articleTitle: $(h1[0]).html() || '',
    htmlToc: {
      items: htmlToc($)
    },
    html: $('body').html() || ''
  };
}
