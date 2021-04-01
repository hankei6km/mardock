import {
  mockDataPagesList,
  mockDataPagesHome,
  mockDataDeckSlide1
} from '../test/testMockData';
import { FetchMock } from 'jest-fetch-mock';
import {
  getSortedPagesData,
  getAllPagesIds,
  getPagesData,
  getPagesSlideData
} from './pages';
import { queryParams } from '../test/testUtils';
import { mockDataPagesIds } from '../test/testMockData';
// https://github.com/jefflau/jest-fetch-mock/issues/83
const fetchMock = fetch as FetchMock;
beforeEach(() => {
  fetchMock.resetMocks();
});

describe('getSortedPagesData()', () => {
  it('should returns contents array with out displayOnIndexPage filed', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockDataPagesList));
    const res = await getSortedPagesData('pages');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/pages?');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourcePages,source,category,mainVisual'
    });
    expect(res).toStrictEqual({
      contents: [
        {
          id: 'home',
          createdAt: '2020-12-27T04:04:30.107Z',
          updatedAt: '2020-12-27T04:04:30.107Z',
          publishedAt: '2020-12-27T04:04:30.107Z',
          revisedAt: '2020-12-27T04:04:30.107Z',
          description: 'description of draftlint',
          title: 'Home',
          category: []
        },
        {
          id: 'deck',
          createdAt: '2020-12-26T15:29:14.476Z',
          updatedAt: '2020-12-26T15:29:14.476Z',
          publishedAt: '2020-12-26T15:29:14.476Z',
          revisedAt: '2020-12-26T15:29:14.476Z',
          title: 'Slides',
          category: []
        }
      ],
      totalCount: 2,
      offset: 0,
      limit: 120000
    });
  });
  it('should pass query params', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockDataPagesList));
    await getSortedPagesData('pages', {
      filters: 'displayOnIndexPage[equals]true'
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/pages?');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourcePages,source,category,mainVisual',
      filters: 'displayOnIndexPage[equals]true'
    });
    // expect(fetchMock.mock.calls[0][1]?.headers) 環境変数の設定とメッセージによっては API キーが漏洩する可能性があるのでとりあえずやめる
  });
});

describe('getAllPagesIds()', () => {
  it('should returns all ids', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockDataPagesIds));
    const res = await getAllPagesIds('pages');
    expect(fetchMock.mock.calls[0][0]).toContain('/pages?');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fields: 'id',
      limit: '120000'
    });
    expect(res).toStrictEqual(['home', 'deck']);
  });
});

describe('getPagesData()', () => {
  it('should returns pageData', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockDataPagesHome));
    const res = await getPagesData('pages', { params: { id: 'home' } });
    expect(fetchMock.mock.calls[0][0]).toContain('/pages/home');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourcePages,source,category,mainVisual,description'
    });
    expect(res).toStrictEqual({
      id: 'home',
      title: 'Home',
      pageCount: -1,
      pageNo: 1,
      allCategory: [],
      category: [],
      curCategory: '',
      description: 'description of draftlint',
      articleTitle: 'Home',
      updated: '2020-12-27T04:04:30.107Z',
      deck: {
        id: '',
        minX: 0,
        minY: 0,
        width: 0,
        height: 0,
        items: [],
        css: ''
      },
      htmlToc: {
        items: []
      },
      html: '<p>home page</p>',
      mainVisual: {
        url:
          'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/eb84db7f1a7a4409bd20ffc27abe60e4/mardock-temp-image.png',
        width: 1280,
        height: 720
      }
    });
  });
  it('should returns pageData contained deckData', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockDataDeckSlide1));
    const res = await getPagesData('pages', { params: { id: 'home' } });
    expect({ ...res, deck: undefined }).toStrictEqual({
      id: 'slide1',
      title: 'Slide1',
      pageCount: -1,
      pageNo: 1,
      allCategory: [],
      category: [],
      curCategory: '',
      description: '',
      articleTitle: 'Slide1',
      updated: '2020-12-26T15:29:14.476Z',
      deck: undefined,
      htmlToc: {
        items: []
      },
      html: '<p>test slide page</p>',
      mainVisual: {
        url:
          'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/eb84db7f1a7a4409bd20ffc27abe60e4/mardock-temp-image.png',
        width: 1280,
        height: 720
      }
    });
    expect(res.deck.items[0].html).toContain('test1');
  });
});

describe('getPagesSlideData()', () => {
  it('should returns slideData', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockDataDeckSlide1));
    const res = await getPagesSlideData('deck', { params: { id: 'slide1' } });
    expect(fetchMock.mock.calls[0][0]).toContain('/deck/slide1');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,sourcePages,source,category,mainVisual,description'
    });
    expect(JSON.stringify(res.head)).toContain('slide1');
    expect(JSON.stringify(res.body)).toContain('item1');
  });
});
