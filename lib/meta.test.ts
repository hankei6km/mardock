import { metaOpen, metaDeck, metaPage } from './meta';
import { blankDeckData } from '../types/pageTypes';

const saveEnv = process.env;
beforeEach(() => {
  process.env = {
    ...saveEnv
  };
  process.env.GITHUB_REPOSITORY = '';
});
afterEach(() => {
  process.env = saveEnv;
});

describe('metaOpen()', () => {
  it('should returns meta object from markdown', () => {
    expect(metaOpen('')).toEqual({ errMessage: '', data: {} });
    expect(metaOpen('# test1\ntest data1')).toEqual({
      errMessage: '',
      data: {}
    });
    expect(metaOpen('---\ntitle: title2\n---\n# test2\ntest data2')).toEqual({
      errMessage: '',
      data: {
        title: 'title2'
      }
    });
    expect(
      metaOpen(
        '---\ntitle: title3\ndescription: desc3\nurl: url3\nimage: image3\n---\n# test3\ntest data3'
      )
    ).toEqual({
      errMessage: '',
      data: {
        title: 'title3',
        description: 'desc3',
        url: 'url3',
        image: 'image3'
      }
    });
    expect(
      metaOpen(
        '---\ntitle: title3\nfoo: 1\ndescription: desc3\nurl: url3\nimage: image3\n---\n# test3\ntest data3'
      )
    ).toEqual({
      errMessage: '',
      data: {
        title: 'title3',
        foo: 1,
        description: 'desc3',
        url: 'url3',
        image: 'image3'
      }
    });
  });
  it('should returns errMessage from invalid soruce', () => {
    const r1 = metaOpen(
      '---\ntitle:title4\ndescription: desc4\nurl: url4\nimage: image4\n---\n# test4\ntest data4'
    );
    expect(r1.errMessage).toContain('YAMLException:');
    expect(r1.data).toEqual({});
    const r2 = metaOpen(
      '---\ntitle:title4\ndescription: desc4\nurl: url4\nimage: image4\n---\n# test4\ntest data4'
    );
    expect(r2.errMessage).toContain('YAMLException:');
    expect(r2.data).toEqual({});
  });
});

describe('metaDeck()', () => {
  it('should returns meta object from deck source', () => {
    expect(
      metaDeck(
        '---\ntitle: title3\nfoo: 1\ndescription: desc3\nurl: url3\nimage: image3\n---\n# test3\ntest data3'
      )
    ).toEqual({
      errMessage: '',
      data: {
        title: 'title3',
        description: 'desc3',
        url: 'url3',
        image: 'image3'
      }
    });
    expect(
      metaDeck(
        '---\ntitle: title4\nfoo: 2\ndescription: 4\nurl: url4\nimage: image4\n---\n# test4\ntest data4'
      )
    ).toEqual({
      errMessage: '',
      data: {
        title: 'title4',
        url: 'url4',
        image: 'image4'
      }
    });
  });
  it('should returns errMessage from invalid soruce', () => {
    const r1 = metaDeck(
      '---\ntitle:title5\ndescription: desc5\nurl: url5\nimage: image5\n---\n# test5\ntest data5'
    );
    expect(r1.errMessage).toContain('YAMLException:');
    expect(r1.data).toEqual({});
  });
});

describe('metaPage()', () => {
  const baseMock = {
    apiName: 'docs' as const,
    id: 'id1',
    updated: '2020-12-27T04:04:30.107Z',
    title: 'title1',
    articleTitle: 'atitle1',
    mainVisual: { url: 'img1', width: 100, height: 100 },
    description: 'desc1',
    deck: blankDeckData()
  };
  it('should returns meta object from page data', () => {
    expect(metaPage({ ...baseMock })).toEqual({
      title: 'atitle1',
      updated: '2020-12-27T04:04:30.107Z',
      link: '/docs/id1',
      keyword: [],
      image: 'img1',
      description: 'desc1'
    });
    expect(
      metaPage({ ...baseMock, mainVisual: { url: '', width: 0, height: 0 } })
    ).toEqual({
      title: 'atitle1',
      updated: '2020-12-27T04:04:30.107Z',
      link: '/docs/id1',
      keyword: [],
      image: '',
      description: 'desc1'
    });
    expect(
      metaPage({
        ...baseMock,
        deck: {
          ...baseMock.deck,
          meta: { title: 'deck title', description: 'deck desc' }
        }
      })
    ).toEqual({
      title: 'deck title',
      updated: '2020-12-27T04:04:30.107Z',
      link: '/docs/id1',
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
          meta: { title: 'deck title', description: 'deck desc' }
        }
      })
    ).toEqual({
      title: 'deck title',
      updated: '2020-12-27T04:04:30.107Z',
      link: '/deck/id1',
      keyword: [],
      image: '/assets/images/id1.png',
      description: 'deck desc'
    });
  });
  it('should returns image url', () => {
    process.env.GITHUB_REPOSITORY = 'hankei6km/mardock';
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
          meta: { title: 'deck title', description: 'deck desc' }
        }
      })
    ).toEqual({
      title: 'deck title',
      link: 'https://hankei6km.github.io/mardock/deck/id1',
      updated: '2020-12-27T04:04:30.107Z',
      keyword: [],
      image: 'https://hankei6km.github.io/mardock/assets/images/id1.png',
      description: 'deck desc'
    });
  });
});
