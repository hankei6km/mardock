import { join } from 'path';
import { getBaseUrl } from '../utils/baseUrl';
import { ConfigImageSource } from './site.config';
import draftlintConfig from './$draftlint-config.json';
// サーバー側で使う設定.
// ブラウザでは使わない or 見せたくない項目(セキュリティ的にの他にサイズ的な等
type SiteServerSideConfig = {
  baseUrl: string;
  globalFeedUrl: string;
  allIdsLimit: number;
  // キャッシュのファイルシステムのパス.
  //  プロジェクトルート起点の相対パスで指定.
  caches: {
    // deck のファイル変換の一時書き出し先。
    // このディレクトリを起点に
    //  contentId/生成されたスライドのhash の構造となる
    // 書き込まれるのは .png 等の他に、処理中を表す pid が書き込まれる。
    deck: string;
  };
  // ビルド時のファイルシステムのパス.
  //  プロジェクトルート起点の相対パスで指定.
  assets: {
    deck: string;
    feeds: string;
  };
  // ブラウザーで参照時のパス.
  // サブディレクトリ等が付いていないルートからのパスとして扱う
  // (GitHub Paegsの user / repo の場合でも無いものとして扱う)
  public: {
    deck: string;
    feeds: string;
  };
  slide: {
    fallbackImage: Omit<ConfigImageSource, 'alt'>;
  };
  mainVisual: {
    fallbackImage: Omit<ConfigImageSource, 'alt'>;
  };
  source: {
    image: {
      transformDefault: string;
    };
    // TODO: 上の image と統合.
    imageQuery: {
      start: string;
      defaultParams: string;
    };
  };
  draft: {
    // types/pageType Notification
    title: string;
    messageHtml: string;
    serverity: 'info' | 'warning' | 'alert';
  };
  draftlintConfig: any;
};

const siteServerSideConfig: SiteServerSideConfig = {
  baseUrl: getBaseUrl(),
  globalFeedUrl: `${getBaseUrl()}/assets/feeds/deck.xml`,
  // id が 1件で 40byte  と想定、 content-length が 5M 程度とのことなので、1000*1000*5 / 40 で余裕を見て決めた値。
  allIdsLimit: 120000,
  caches: {
    deck: join('.mardock', 'cache', 'deck')
  },
  assets: {
    deck: join('public', 'assets', 'deck'),
    feeds: join('public', 'assets', 'feeds')
  },
  public: {
    deck: join('/', 'assets', 'deck'),
    feeds: join('/', 'assets', 'feeds')
  },
  slide: {
    fallbackImage: {
      url:
        'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/eb84db7f1a7a4409bd20ffc27abe60e4/mardock-temp-image.png',
      width: 1280,
      height: 720
    }
  },
  mainVisual: {
    fallbackImage: {
      url:
        'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/eb84db7f1a7a4409bd20ffc27abe60e4/mardock-temp-image.png',
      width: 1280,
      height: 720
    }
  },
  source: {
    image: {
      transformDefault: 'w=600'
    },
    imageQuery: {
      start: 'https://images.microcms-assets.io/assets/',
      defaultParams: 'auto=compress'
    }
  },
  draft: {
    title: '[DRAFT]',
    messageHtml: '<p><a href="/api/exit-preview">プレビュー終了</a></p>',
    serverity: 'info'
  },
  draftlintConfig: JSON.parse((draftlintConfig.config || '[{"raw":""}]')[0].raw)
};
export default siteServerSideConfig;
