import cheerio from 'cheerio';
import {
  getPageHtml,
  splitStrToParagraph,
  getTocLabel,
  getArticleData,
  adjustHeading,
  htmlToc
} from './html';

describe('splitStrToParagraph()', () => {
  it('should splits html string in p tag at multiple br tag.', () => {
    expect(
      splitStrToParagraph('<p>test1<br>test2</p><p>test3<br><br>test4</p>')
    ).toStrictEqual('<p>test1<br>test2</p><p>test3</p><p>test4</p>');
    expect(
      splitStrToParagraph(
        '<p>test1<br>test2</p><p>test3<br><br><br><br>test4</p>'
      )
    ).toStrictEqual('<p>test1<br>test2</p><p>test3</p><p>test4</p>');
    expect(
      splitStrToParagraph(
        '<p>test1<br/>test2</p><p>test3<br /><br /><br/><br/>test4</p>'
      )
    ).toStrictEqual('<p>test1<br>test2</p><p>test3</p><p>test4</p>');
    expect(
      splitStrToParagraph(
        '<p>test1<br>test2</p><p>test3<br><br>test4<br><br></p>'
      )
    ).toStrictEqual('<p>test1<br>test2</p><p>test3</p><p>test4</p>');
    expect(
      splitStrToParagraph(
        '<h1>title1</h1><p>test1<br>test2</p><h2>title2</h2><p>test3<br><br><br><br>test4</p>'
      )
    ).toStrictEqual(
      '<h1>title1</h1><p>test1<br>test2</p><h2>title2</h2><p>test3</p><p>test4</p>'
    );
    expect(
      splitStrToParagraph(
        '<h1>title</h1><p>test1<br>test2</p><p>test3<br><br><br><br>test4</p>'
      )
    ).toStrictEqual(
      '<h1>title</h1><p>test1<br>test2</p><p>test3</p><p>test4</p>'
    );
    expect(
      splitStrToParagraph(
        '<h1>title</h1><p>test1<br>test2<br>test3<br><br><br><br>test4<br>test5</p>'
      )
    ).toStrictEqual(
      '<h1>title</h1><p>test1<br>test2<br>test3</p><p>test4<br>test5</p>'
    );
  });
});

describe('getPageHtml()', () => {
  it('should returns pageHtml', async () => {
    expect(getPageHtml('title1', '<p>test1</p>')).toStrictEqual(
      '<h1>title1</h1><p>test1</p>'
    );
    expect(getPageHtml('Home', '<h1>title2</h1><p>test2</p>')).toStrictEqual(
      '<h1>title2</h1><p>test2</p>'
    );
    expect(
      getPageHtml('Home', '<h1>title2</h1><p>test3<br><br>test4</p>')
    ).toStrictEqual('<h1>title2</h1><p>test3</p><p>test4</p>');
  });
});

describe('getTocLabel()', () => {
  it('should returns label to using in toc', () => {
    expect(getTocLabel('test')).toEqual('test');
    expect(getTocLabel('test1 test2\ttest3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1  test2\t\ttest3')).toEqual('test1--test2--test3');
    expect(getTocLabel('test1\ntest2\n\rtest3')).toEqual('test1-test2--test3');
    expect(getTocLabel('test1#test2.test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1&test2>test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1[test2]test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('test1:test2;test3')).toEqual('test1-test2-test3');
    expect(getTocLabel('#.()[]{}<>@&%$"`=_:;\'\\ \t\n\r')).toEqual(
      '--------------------------'
    );
  });
});

describe('adjustHeading()', () => {
  const getSlidedHtml = (html: string): string => {
    const $ = cheerio.load(html);
    adjustHeading($);
    return $('body').html() || '';
  };
  it('should slide depth of heding', async () => {
    expect(getSlidedHtml('<h2>title1</h2>')).toStrictEqual(
      '<h3 id="title1">title1</h3>'
    );
    expect(
      getSlidedHtml('<h2>title1</h2><p>test1</p><h2>title2</h2><p>test2</p>')
    ).toStrictEqual(
      '<h3 id="title1">title1</h3><p>test1</p><h3 id="title2">title2</h3><p>test2</p>'
    );
    expect(
      getSlidedHtml('<h2>title1</h2><p>test1</p><h3>title2</h3><p>test2</p>')
    ).toStrictEqual(
      '<h3 id="title1">title1</h3><p>test1</p><h4 id="title2">title2</h4><p>test2</p>'
    );
  });
});

describe('htmlContent()', () => {
  it('should returns toc of html', () => {
    expect(
      htmlToc(
        cheerio.load('<h3 id="test1">test1</h3><h3 id="test2">test2</h3>'),
        [{ label: 'section title', items: [], depth: 0, id: 'section-title' }]
      )
    ).toEqual([
      {
        label: 'section title',
        items: [
          {
            label: 'test1',
            items: [],
            depth: 1,
            id: 'test1'
          },
          {
            label: 'test2',
            items: [],
            depth: 1,
            id: 'test2'
          }
        ],
        depth: 0,
        id: 'section-title'
      }
    ]);
  });
  it('should returns toc of html(nested)', () => {
    expect(
      htmlToc(
        cheerio.load(
          '<h3 id="test1">test1</h3><p>abc</p><h4 id="test3">test3</h4><p>123</p><h4 id="test4">test4</h4><h3 id="test2">test2</h3>'
        ),
        [{ label: 'section title', items: [], depth: 0, id: 'section-title' }]
      )
    ).toEqual([
      {
        label: 'section title',
        items: [
          {
            label: 'test1',
            items: [
              {
                label: 'test3',
                items: [],
                depth: 2,
                id: 'test3'
              },
              {
                label: 'test4',
                items: [],
                depth: 2,
                id: 'test4'
              }
            ],
            depth: 1,
            id: 'test1'
          },
          {
            label: 'test2',
            items: [],
            depth: 1,
            id: 'test2'
          }
        ],
        depth: 0,
        id: 'section-title'
      }
    ]);
  });
  it('should returns toc of html(without section title)', () => {
    expect(
      htmlToc(
        cheerio.load('<h3 id="test1">test1</h3><h3 id="test2">test2</h3>'),
        []
      )
    ).toEqual([
      {
        label: 'test1',
        items: [],
        depth: 1,
        id: 'test1'
      },
      {
        label: 'test2',
        items: [],
        depth: 1,
        id: 'test2'
      }
    ]);
  });
});

describe('getArticleData()', () => {
  it('should returns article data', async () => {
    expect(getArticleData('title1', '<p>test1</p>')).toStrictEqual({
      articleTitle: 'title1',
      html: '<p>test1</p>',
      htmlToc: { items: [] }
    });
    expect(
      getArticleData('title1', '<h1>article title1</h1><p>test1</p>')
    ).toStrictEqual({
      articleTitle: 'article title1',
      html: '<p>test1</p>',
      htmlToc: { items: [] }
    });
    expect(
      getArticleData(
        'title1',
        '<h1>article title1</h1><p>test1</p><h2>title2</h2><p>test2</p>'
      )
    ).toStrictEqual({
      articleTitle: 'article title1',
      html: '<p>test1</p><h3 id="title2">title2</h3><p>test2</p>',
      htmlToc: {
        items: [
          {
            depth: 1,
            items: [],
            label: 'title2',
            id: 'title2'
          }
        ]
      }
    });
    // TODO: h1 が複数あった場合の対処.
    // toc の扱いも考える必要がある.
    expect(
      getArticleData(
        'title1',
        '<h1>article title1</h1><p>test1</p><h1>title2</h1><p>test2</p>'
      )
    ).toStrictEqual({
      articleTitle: 'article title1',
      html: '<p>test1</p><h2 id="title2">title2</h2><p>test2</p>',
      htmlToc: {
        items: []
      }
    });
  });
});
