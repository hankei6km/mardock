import { metaOpen, metaDeck, metaPage } from './meta';
import { blankDeckData } from '../types/pageTypes';

describe('metaOpen()', () => {
  it('should returns meta object from markdown', () => {
    expect(metaOpen('')).toEqual({});
    expect(metaOpen('# test1\ntest data1')).toEqual({});
    expect(metaOpen('---\ntitle: title2\n---\n# test2\ntest data2')).toEqual({
      title: 'title2'
    });
    expect(
      metaOpen(
        '---\ntitle: title3\ndescription: desc3\nurl: url3\nimage: image3\n---\n# test3\ntest data3'
      )
    ).toEqual({
      title: 'title3',
      description: 'desc3',
      url: 'url3',
      image: 'image3'
    });
    expect(
      metaOpen(
        '---\ntitle: title3\nfoo: 1\ndescription: desc3\nurl: url3\nimage: image3\n---\n# test3\ntest data3'
      )
    ).toEqual({
      title: 'title3',
      foo: 1,
      description: 'desc3',
      url: 'url3',
      image: 'image3'
    });
  });
});

describe('metaDeck()', () => {
  it('should returns meta object from deck source', () => {
    expect(
      metaDeck(
        '---\ntitle: title3\nfoo: 1\ndescription: desc3\nurl: url3\nimage: image3\n---\n# test3\ntest data3'
      )
    ).toEqual({
      title: 'title3',
      description: 'desc3',
      url: 'url3',
      image: 'image3'
    });
    expect(
      metaDeck(
        '---\ntitle: title4\nfoo: 2\ndescription: 4\nurl: url4\nimage: image4\n---\n# test4\ntest data4'
      )
    ).toEqual({
      title: 'title4',
      url: 'url4',
      image: 'image4'
    });
  });
});

describe('metaPage()', () => {
  const baseMock = {
    apiName: 'docs' as const,
    id: 'id1',
    title: 'title1',
    articleTitle: 'atitle1',
    mainVisual: { url: 'img1', width: 100, height: 100 },
    description: 'desc1',
    deck: {
      slide: blankDeckData(),
      overview: blankDeckData()
    }
  };
  it('should returns meta object from page data', () => {
    expect(metaPage({ ...baseMock })).toEqual({
      title: 'atitle1',
      keyword: [],
      image: 'img1',
      description: 'desc1'
    });
    expect(
      metaPage({ ...baseMock, mainVisual: { url: '', width: 0, height: 0 } })
    ).toEqual({
      title: 'atitle1',
      keyword: [],
      image: '',
      description: 'desc1'
    });
    expect(
      metaPage({
        ...baseMock,
        deck: {
          ...baseMock.deck,
          slide: {
            ...baseMock.deck.slide,
            meta: { title: 'deck title', description: 'deck desc' }
          }
        }
      })
    ).toEqual({
      title: 'deck title',
      keyword: [],
      image: 'img1',
      description: 'deck desc'
    });
    expect(
      metaPage({
        ...baseMock,
        apiName: 'deck',
        mainVisual: {
          url: '',
          width: 0,
          height: 0
        },
        deck: {
          ...baseMock.deck,
          slide: {
            ...baseMock.deck.slide,
            meta: { title: 'deck title', description: 'deck desc' }
          }
        }
      })
    ).toEqual({
      title: 'deck title',
      keyword: [],
      image: '/assets/images/id1.png',
      description: 'deck desc'
    });
  });
});
