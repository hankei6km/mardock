import { PassThrough } from 'stream';
import { feedWrite } from '../lib/feed';

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

describe('feedWrite()', () => {
  const baseMock = [
    {
      title: 'deck title2',
      link: 'https://hankei6km.github.io/mardock/deck/id2',
      updated: '2020-12-27T04:04:30.107Z',
      keyword: [],
      image: 'https://hankei6km.github.io/mardock/assets/images/id2.png',
      description: 'deck desc2'
    },
    {
      title: 'deck title1',
      link: 'https://hankei6km.github.io/mardock/deck/id1',
      updated: '2020-12-26T04:04:30.107Z',
      keyword: [],
      image: 'https://hankei6km.github.io/mardock/assets/images/id1.png',
      description: 'deck desc11'
    }
  ];
  it('should write rss feed to stream', async () => {
    let b = '';
    const w = new PassThrough();
    const ex = new Promise((resolve) => {
      w.on('data', (data) => {
        b = b + data.toString();
      });
      w.on('end', () => {
        resolve(b);
      });
    });
    feedWrite(
      {
        id: 'https://hankei6km.github.io/mardock',
        title: 'mardock',
        updated: new Date('2020-12-26T04:04:30.107Z'),
        copyright: ''
      },
      [...baseMock],
      w
    );
    expect(await ex).toEqual(`<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
    <channel>
        <title>mardock</title>
        <link>undefined</link>
        <description>undefined</description>
        <lastBuildDate>Sat, 26 Dec 2020 04:04:30 GMT</lastBuildDate>
        <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
        <generator>https://github.com/jpmonette/feed</generator>
        <item>
            <title><![CDATA[deck title2]]></title>
            <link>https://hankei6km.github.io/mardock/deck/id2</link>
            <guid>https://hankei6km.github.io/mardock/deck/id2</guid>
            <pubDate>Sun, 27 Dec 2020 04:04:30 GMT</pubDate>
            <description><![CDATA[deck desc2]]></description>
        </item>
        <item>
            <title><![CDATA[deck title1]]></title>
            <link>https://hankei6km.github.io/mardock/deck/id1</link>
            <guid>https://hankei6km.github.io/mardock/deck/id1</guid>
            <pubDate>Sat, 26 Dec 2020 04:04:30 GMT</pubDate>
            <description><![CDATA[deck desc11]]></description>
        </item>
    </channel>
</rss>`);
  });
});
