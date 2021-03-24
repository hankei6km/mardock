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

type Pages = {
  title: string;
  category: PagesCategory[];
  html?: string;
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
  html: ''
});
