import { PagesContents } from '../types/client/contentTypes';

export const mockDataPagesContents: PagesContents['contents'] = [
  {
    id: 'home',
    createdAt: '2020-12-27T04:04:30.107Z',
    updatedAt: '2020-12-27T04:04:30.107Z',
    publishedAt: '2020-12-27T04:04:30.107Z',
    revisedAt: '2020-12-27T04:04:30.107Z',
    title: 'Home',
    category: [],
    description: 'description of draftlint',
    content: 'home page'
  },
  {
    id: 'deck',
    createdAt: '2020-12-26T15:29:14.476Z',
    updatedAt: '2020-12-26T15:29:14.476Z',
    publishedAt: '2020-12-26T15:29:14.476Z',
    revisedAt: '2020-12-26T15:29:14.476Z',
    title: 'Slides',
    category: [],
    content: 'documents page'
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
    content: undefined
  }))
};

export const mockDataPagesIds = {
  ...mockDataPages,
  contents: mockDataPages.contents.map(({ id }) => ({ id }))
};

export const mockDataDeckContents: PagesContents['contents'] = [
  {
    id: 'slide1',
    createdAt: '2020-12-26T15:29:14.476Z',
    updatedAt: '2020-12-26T15:29:14.476Z',
    publishedAt: '2020-12-26T15:29:14.476Z',
    revisedAt: '2020-12-26T15:29:14.476Z',
    title: 'Slide1',
    category: [],
    content: 'test slide page',
    source:
      '<p>---</p><p>title: slide1</p><p>---</p><h1>test1</h1><p>---</p><ul><li>item1</li><li>item2</li></ul>'
  }
];

export const mockDataDeckSlide1 = mockDataDeckContents[0];
