type ContentBase = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt?: string; // 古いcontentにはついていないのでオプショナル.
};

type ContentList<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

type Pages = {
  title: string;
  markdown?: string;
  mainVisual?: { url: string; width: number; height: number };
  description?: string;
};
export type PagesContent = ContentBase & Pages;
export type PagesIndex = Omit<PagesContent, 'markdown'>;
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
  markdown: ''
});
