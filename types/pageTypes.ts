import { PagesCategory } from './client/contentTypes';

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
  minX: number;
  minY: number;
  width: number;
  height: number;
  css: string;
  items: DeckItem[];
};

type Notification = {
  title: string;
  messageHtml: string;
  serverity: 'info' | 'warning' | 'alert';
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
  html: string;
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
  html: '',
  deck: {
    minX: 0,
    minY: 0,
    width: 0,
    height: 0,
    items: [],
    css: ''
  },
  mainVisual: { url: '', width: 0, height: 0 },
  description: ''
});

export const blankSlideData = (): SlideData => ({
  head: [],
  body: []
});
