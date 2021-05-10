import * as fs from 'fs';
import { writeFeed } from '../lib/feed';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest
    .fn()
    .mockImplementation(jest.requireActual('fs').createWriteStream)
}));

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

describe('writeFeed()', () => {
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
  it('should write feed file then return path to feed', async () => {
    const write = jest.fn();
    const close = jest.fn();
    const createWriteStream = jest
      .spyOn(fs, 'createWriteStream')
      .mockImplementation((_p, _o) => {
        return ({
          write,
          on: jest.fn(),
          close
        } as unknown) as fs.WriteStream;
      });
    expect(
      await writeFeed(
        {
          id: 'https://hankei6km.github.io/mardock',
          title: 'mardock',
          updated: new Date('2020-12-26T04:04:30.107Z'),
          copyright: ''
        },
        [...baseMock],
        'deck'
      )
    ).toEqual('/assets/feeds/deck.xml');
    expect(createWriteStream).toHaveBeenCalledWith(
      'public/assets/feeds/deck.xml',
      {
        flags: 'wx',
        encoding: 'utf8'
      }
    );
    expect(write.mock.calls[0][0])
      .toEqual(`<?xml version="1.0" encoding="utf-8"?>
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
            <enclosure url="https://hankei6km.github.io/mardock/assets/images/id2.png" length="0" type="image/png"/>
        </item>
        <item>
            <title><![CDATA[deck title1]]></title>
            <link>https://hankei6km.github.io/mardock/deck/id1</link>
            <guid>https://hankei6km.github.io/mardock/deck/id1</guid>
            <pubDate>Sat, 26 Dec 2020 04:04:30 GMT</pubDate>
            <description><![CDATA[deck desc11]]></description>
            <enclosure url="https://hankei6km.github.io/mardock/assets/images/id1.png" length="0" type="image/png"/>
        </item>
    </channel>
</rss>`);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
