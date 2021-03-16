import { PagesContents } from '../types/client/contentTypes';

export const mockDataPagesContents: PagesContents['contents'] = [
  {
    id: 'home',
    createdAt: '2020-12-27T04:04:30.107Z',
    updatedAt: '2020-12-27T04:04:30.107Z',
    publishedAt: '2020-12-27T04:04:30.107Z',
    revisedAt: '2020-12-27T04:04:30.107Z',
    title: 'Home',
    description: 'description of draftlint',
    markdown: 'home page'
  },
  {
    id: 'deck',
    createdAt: '2020-12-26T15:29:14.476Z',
    updatedAt: '2020-12-26T15:29:14.476Z',
    publishedAt: '2020-12-26T15:29:14.476Z',
    revisedAt: '2020-12-26T15:29:14.476Z',
    title: 'Slides',
    markdown: 'documents page'
  }
];
export const mockDataPages: PagesContents = {
  contents: mockDataPagesContents,
  totalCount: mockDataPagesContents.length,
  offset: 0,
  limit: 120000
};

export const mockDataPagesHome = {
  ...mockDataPages.contents[0]
};

export const mockDataPagesBlog = {
  ...mockDataPages,
  contents: [mockDataPages.contents[1]]
};

export const mockDataPagesList = {
  ...mockDataPages,
  contents: mockDataPages.contents.map((v) => ({
    ...v,
    markdown: undefined
  }))
};

export const mockDataPagesIds = {
  ...mockDataPages,
  contents: mockDataPages.contents.map(({ id }) => ({ id }))
};
