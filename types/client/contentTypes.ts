type ContentBase = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt?: string; // 古いcontentにはついていないのでオプショナル.
};

export type ContentList<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type PagesCategory = {
  id: string;
  title: string;
};

export type PagesImage = {
  url: string;
  width: number;
  height: number;
};

export type PagesSourcePageMarkdown = {
  fieldId: 'sourceMarkdown';
  markdown: string;
};
export type PagesSourcePageHtml = {
  fieldId: 'sourceHtml';
  html: string;
};
export type PagesSourcePageImage = {
  fieldId: 'sourceImage';
  image: PagesImage;
  directive?: string;
  transform?: string;
};
export type PagesSourcePageComment = {
  fieldId: 'sourceComment';
  comment: string;
};
export type PagesSourcePageContent =
  | PagesSourcePageHtml
  | PagesSourcePageMarkdown
  | PagesSourcePageImage
  | PagesSourcePageComment;
export type PagesSourcePageContents = PagesSourcePageContent[];
export type PagesSourcePage = {
  fieldId: 'sourcePages';
  contents: PagesSourcePageContents;
};
export type PagesSourcePages = PagesSourcePage[];

type Pages = {
  title: string;
  category: PagesCategory[];
  content?: string;
  sourcePages?: PagesSourcePages;
  source?: string;
  mainVisual?: PagesImage;
  description?: string;
};
export type PagesContent = ContentBase & Pages;
export type PagesIndex = PagesContent;
export type PagesId = Pick<PagesContent, 'id'>;
export type PagesContents = ContentList<PagesContent>;
export type PagesIdsContents = Omit<PagesContents, 'offset' | 'limit'>;
export type PagesList = ContentList<PagesIndex>;
export type PagesIds = ContentList<PagesId>;

const contentBase: ContentBase = {
  id: '',
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
  revisedAt: ''
};

export const blankPagesList = (): PagesList => ({
  contents: [],
  totalCount: 0,
  limit: 0,
  offset: 0
});

export const blankPageContent = (): PagesContent => ({
  ...contentBase,
  title: '',
  category: [],
  content: ''
});
