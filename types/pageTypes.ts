import { PagesCategory } from './client/contentTypes';

export type PageData = {
  id: string;
  updated: string; // この段階では Date にはしない
  notification?: {
    title: string;
    messageHtml: string;
    serverity: 'info' | 'warning' | 'alert';
  };
  pageNo: number; // pagination 用、getStaticProps で付与される.
  pageCount: number; // pagination しないときは -1.
  allCategory: PagesCategory[];
  category: PagesCategory[];
  curCategory: string; //  route 上で選択されているカテゴリ、getStaticProps で付与される.選択されていないときは ''
  title: string;
  articleTitle: string;
  markdown: string;
  mainVisual: string;
  description: string;
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
  markdown: '',
  mainVisual: '',
  description: ''
});
