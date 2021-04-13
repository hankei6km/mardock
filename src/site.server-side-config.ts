import { join } from 'path';
import { ConfigImageSource } from './site.config';
// サーバー側で使う設定.
// ブラウザでは使わない or 見せたくない項目(セキュリティ的にの他にサイズ的な等
type SiteServerSideConfig = {
  allIdsLimit: number;
  // ビルド時のファイルシステムのパス.
  //  プロジェクトルート起点の相対パスで指定.
  assets: {
    imagesPath: string;
    pdfPath: string;
  };
  // ブラウザーで参照時のパス.
  // サブディレクトリ等が付いていないルートからのパスとして扱う
  // (GitHub Paegsの user / repo の場合でも無いものとして扱う)
  public: {
    imagesPath: string;
    pdfPath: string;
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
  };
  draft: {
    // types/pageType Notification
    title: string;
    messageHtml: string;
    serverity: 'info' | 'warning' | 'alert';
  };
};

const siteServerSideConfig: SiteServerSideConfig = {
  // id が 1件で 40byte  と想定、 content-length が 5M 程度とのことなので、1000*1000*5 / 40 で余裕を見て決めた値。
  allIdsLimit: 120000,
  assets: {
    imagesPath: join('public', 'assets', 'images'),
    pdfPath: join('public', 'assets', 'pdf')
  },
  public: {
    imagesPath: join('/', 'assets', 'images'),
    pdfPath: join('/', 'assets', 'pdf')
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
    }
  },
  draft: {
    title: '[DRAFT]',
    messageHtml: '<p><a href="/api/exit-preview">プレビュー終了</a></p>',
    serverity: 'info'
  }
};
export default siteServerSideConfig;
