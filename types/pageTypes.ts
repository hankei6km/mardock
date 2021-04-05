import { ContentList, PagesCategory } from './client/contentTypes';

export type SlideHeadData = {
  tagName: string;
  attribs: { [name: string]: string };
  html: string;
};
// 今回は style 無し(扱う場合は starter の方から変換処理持ってくる).
// export type SlideBodyData = {
//   style: { [name: string]: string };
// } & SlideHeadData;
export type SlideBodyData = SlideHeadData;

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
  deck: DeckData;
  mainVisual: {
    url: string;
    width: number;
    height: number;
  };
  description: string;
};

export type SlideData = {
  notification?: Notification;
  head: SlideHeadData[];
  body: SlideBodyData[];
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
>;
export type IndexList = ContentList<IndexData>;

export const blankDeckData = (): DeckData => ({
  id: '',
  minX: 0,
  minY: 0,
  width: 0,
  height: 0,
  items: [],
  css: '',
  script: []
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
    ...blankDeckData()
  },
  mainVisual: { url: '', width: 0, height: 0 },
  description: ''
});

export const blankSlideData = (): SlideData => ({
  head: [],
  body: []
});

export const blankIndexData = (): IndexData => ({
  id: '',
  updated: '',
  title: '',
  category: [],
  articleTitle: '',
  deck: {
    id: '',
    minX: 0,
    minY: 0,
    width: 0,
    height: 0,
    items: [],
    css: '',
    script: []
  },
  mainVisual: { url: '', width: 0, height: 0 },
  description: ''
});

export const blankIndexList = (): IndexList => ({
  contents: [],
  totalCount: 0,
  limit: 0,
  offset: 0
});
