import { ContentList, PagesCategory } from './client/contentTypes';

export type DeckItem = {
  html: string;
};
export type DeckData = {
  id: string;
  minX: number;
  minY: number;
  width: number;
  height: number;
  css: string;
  script: string[];
  items: DeckItem[];
  source: string;
  meta: { [key: string]: string };
};

export type Notification = {
  title: string;
  messageHtml: string;
  serverity: 'info' | 'warning' | 'alert';
};

export type TocItem = {
  depth: number;
  label: string;
  items: TocItems; // 階層を無限に増やせるが、今回は 2 階層のみ.
  id: string;
};
export type TocItems = TocItem[];
export type HtmlToc = {
  // label: string;
  items: TocItem[];
};

export type MetaData = {
  title: string;
  link: string;
  updated: string;
  keyword: string[]; // 今回は使わない、か category をコピーか.
  description: string;
  image: string; // Tewitter card 等のバリエーションは保持しない、利用時に生成する(imgix 前提)
};

export type PageData = {
  id: string;
  updated: string; // この段階では Date にはしない
  notification?: Notification;
  pageNo: number; // pagination 用、getStaticProps で付与される.
  pageCount: number; // pagination しないときは -1.
  allCategory: PagesCategory[];
  category: PagesCategory[];
  curCategory: string; //  route 上で選択されているカテゴリ、getStaticProps で付与される.選択されていないときは ''
  title: string;
  articleTitle: string;
  htmlToc: HtmlToc;
  html: string; // markdown から変換された html がセットされる.
  deck: {
    slide: DeckData;
    overview: DeckData;
    hash: string;
  };
  mainVisual: {
    url: string;
    width: number;
    height: number;
  };
  description: string;
  meta: MetaData;
  feedUrl: string;
};

// リストの項目用. この辺はもう少しきちんと作り直す/
export type IndexData = Omit<
  PageData,
  | 'notification'
  | 'pageNo'
  | 'pageCount'
  | 'allCategory'
  | 'curCategory'
  | 'htmlToc'
  | 'html'
  | 'deck'
  | 'feedUrl'
> & { deck: DeckData };
export type IndexList = ContentList<IndexData>;

export const blankDeckData = (): DeckData => ({
  id: '',
  minX: 0,
  minY: 0,
  width: 0,
  height: 0,
  items: [],
  css: '',
  script: [],
  source: '',
  meta: {}
});

export const blankMetaData = (): MetaData => ({
  title: '',
  link: '',
  updated: '', // 現在時刻を入れておくか？
  keyword: [],
  description: '',
  image: ''
});
export const blankPageData = (): PageData => ({
  id: '',
  updated: '',
  title: '',
  pageNo: 1,
  pageCount: -1,
  allCategory: [],
  category: [],
  curCategory: '',
  articleTitle: '',
  htmlToc: {
    items: []
  },
  html: '',
  deck: {
    slide: {
      ...blankDeckData()
    },
    overview: {
      ...blankDeckData()
    },
    hash: ''
  },
  mainVisual: { url: '', width: 0, height: 0 },
  description: '',
  meta: blankMetaData(),
  feedUrl: ''
});

export const blankIndexData = (): IndexData => ({
  id: '',
  updated: '',
  title: '',
  category: [],
  articleTitle: '',
  deck: blankDeckData(),
  mainVisual: { url: '', width: 0, height: 0 },
  description: '',
  meta: blankMetaData()
});

export const blankIndexList = (): IndexList => ({
  contents: [],
  totalCount: 0,
  limit: 0,
  offset: 0
});
