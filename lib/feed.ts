import { createWriteStream } from 'fs';
import { join } from 'path';
import { Feed, FeedOptions } from 'feed';
import siteServerSideConfig from '../src/site.server-side-config';
import { MetaData } from '../types/pageTypes';

export function getFeedsPublicPath(name: string): string {
  return join(siteServerSideConfig.public.feedsPath, name);
}
export function getFeedsPath(name: string): string {
  return join(siteServerSideConfig.assets.feedsPath, name);
}

export function feed(options: FeedOptions, metas: MetaData[]) {
  const feed = new Feed(options);
  metas.forEach((meta) => {
    feed.addItem({
      title: meta.title,
      id: meta.link,
      link: meta.link,
      date: new Date(meta.updated),
      description: meta.description,
      image: meta.image
    });
  });
  return feed.rss2();
}

export async function writeFeed(
  options: FeedOptions,
  metas: MetaData[],
  name: string
): Promise<string> {
  let ret = getFeedsPublicPath(`${name}.xml`);
  try {
    const f = feed(options, metas);
    const p = getFeedsPath(`${name}.xml`);
    const w = createWriteStream(p, { flags: 'wx', encoding: 'utf8' });
    w.on('error', () => {
      // 'wx' で上書き失敗したときのエラー
    });
    w.write(f);
    w.close();
    ret = `${siteServerSideConfig.baseUrl}${ret}`;
  } catch (err) {
    console.error(err);
    ret = '';
  }
  return ret;
}
