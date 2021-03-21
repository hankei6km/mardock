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
  mainVisual: string;
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
  mainVisual: '',
  description: ''
});

export const blankSlideData = (): SlideData => ({
  head: [],
  body: []
});
