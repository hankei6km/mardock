import cheerio from 'cheerio';
import hljs from 'highlight.js';
import { imageInfo } from './image';
// https://microcms.io/blog/syntax-highlighting-on-server-side

// './html.ts とかなり似たような使われ方をするが、
// こちらは主に見た目に関連する処理を行う.
type rewritePlug = ($: cheerio.Root) => Promise<Error | null>;

export function rewriteImg(): rewritePlug {
  // どうにも気になったので属性設定しておく
  // (img は書き換え用のツールを作ってあるのでいずれ差し替える)
  return async ($) => {
    // const ilen = $('img').length;
    // const p = new Array<() => Promise<void>>(ilen);
    const p: (() => Promise<void>)[] = [];
    $('img').each((_idx, elm) => {
      const $elm = $(elm);
      const src = $elm.attr('src')?.split('?', 2)[0];
      if (src) {
        p.push(async () => {
          const info = await imageInfo(src);
          // 今回は横長しかない前提.
          if (info.width > 600) {
            const width = 600;
            const height = (info.height * 600) / info.width;
            $elm.attr('width', `${width}`);
            $elm.attr('height', `${height}`);
            const q = new URLSearchParams('');
            q.append('w', `${width}`);
            q.append('h', `${height}`);
            $elm.attr('src', `${src}?${q.toString()}`);
          }
        });
      }
    });
    await Promise.all(p.map((p) => p()));
    return null;
  };
}

export function rewriteEmbed(): rewritePlug {
  return async ($) => {
    // $('body > iframe').wrap('<div class="embed"></div>');
    $('body > iframe').each((_idx, elm) => {
      const $div = cheerio.load('<div></div>')('div');
      $div.addClass('embed');
      const $elm = $(elm);
      if ($elm.attr('title') === 'YouTube embed') {
        const s = $elm.attr('src')?.split('?', 2) || [];
        const sq = new URLSearchParams(s[1]);
        const url = sq.get('url');
        if (url) {
          const q = new URLSearchParams(url.split('?', 2)[1]);
          const videoid = q.get('v');
          if (videoid) {
            const $lite = cheerio.load('<lite-youtube>')('lite-youtube');
            $lite.attr('videoid', videoid);
            $lite.attr('params', 'rel=0');
            $div.addClass('youtube');
            $lite.wrap($div);
            $elm.replaceWith($lite.parent());
            return;
          }
        }
      }
      $elm.wrap($div);
    });
    // router と相性がよくない.
    // if (loadLiteYoutube) {
    //   const $script = cheerio.load('<script type="text/javascript"/>')(
    //     'script'
    //   );
    //   //  _app で css を import している.
    //   $script.text(
    //     readFileSync(
    //       'node_modules/lite-youtube-embed/src/lite-yt-embed.js'
    //     ).toString('utf-8')
    //   );
    //   $('body').append($script);
    // }
    return null;
  };
}

export function rewriteCode(): rewritePlug {
  return async ($) => {
    $('pre code').each((_idx, elm) => {
      const result = hljs.highlightAuto($(elm).text(), [
        // codeblock で class 名が指定できないと(さらに一部抜粋だと)
        // 認識率は高くないので絞る.
        // https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md
        'typescript',
        //'tsx',
        'json',
        'yml',
        'yaml',
        'html',
        'css',
        'javascript',
        'jsx',
        'shell',
        'console',
        'bash',
        'sh',
        'zsh'
      ]);
      $(elm).html(result.value);
      $(elm).addClass('hljs');
    });
    return null;
  };
}

type chain = {
  use: (p: rewritePlug) => chain;
  run: () => Promise<string>;
};

export function rewrite(body: string): chain {
  const $ = cheerio.load(body);

  const plugs: rewritePlug[] = [];
  const runFunc = async () => {
    // plugs.forEach((v) => v($));
    const plen = plugs.length;
    for (let i = 0; i < plen; i++) {
      await plugs[i]($);
    }
    return $('body').html() || '';
  };
  const useFunc = (p: rewritePlug) => {
    plugs.push(p);
    return {
      use: useFunc,
      run: runFunc
    };
  };
  return {
    use: useFunc,
    run: runFunc
  };
}
