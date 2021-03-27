import cheerio from 'cheerio';
import { TocItems } from '../types/pageTypes';

export function splitStrToParagraph(html: string): string {
  const $ = cheerio.load(html);
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

export function getPageHtml(title: string, html: string): string {
  const $ = cheerio.load(splitStrToParagraph(html));
  // const $ = cheerio.load(html);
  if ($('h1').length === 0) {
    $('body').prepend('<h1></h1>');
    $('h1').text(title);
  }
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

function _slideHeading($: cheerio.Root, h: number) {
  const headding = `h${h}`;
  const slided = `h${h + 1}`;
  $(headding).each((_idx, elm) => {
    if (elm.type === 'tag' && elm.tagName === headding) {
      elm.tagName = slided;
    }
  });
}

export function slideHeading($: cheerio.Root) {
  _slideHeading($, 5);
  _slideHeading($, 4);
  _slideHeading($, 3);
  _slideHeading($, 2);
  _slideHeading($, 1);
}

export function getTitleAndContent(
  title: string,
  html: string
): {
  articleTitle: string;
  html: string;
} {
  const $ = cheerio.load(splitStrToParagraph(html));
  // const $ = cheerio.load(html);
  const h1 = $('body h1:first');
  if (h1.length === 0) {
    slideHeading($);
    return {
      articleTitle: title,
      html: $('body').html() || ''
    };
  }
  h1.remove();
  slideHeading($);
  return {
    articleTitle: $(h1[0]).html() || '',
    html: $('body').html() || ''
  };
}

export function htmlContent(
  html: string,
  root: TocItems = [],
  opts: { top: number; depth: number } = { top: 2, depth: 1 }
): TocItems {
  const $ = cheerio.load(html);
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
