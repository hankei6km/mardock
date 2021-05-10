import { Feed, FeedOptions } from 'feed';
import { Writable } from 'stream';
import { MetaData } from '../types/pageTypes';

export function feed(options: FeedOptions, metas: MetaData[]) {
  const feed = new Feed(options);
  metas.forEach((meta) => {
    feed.addItem({
      title: meta.title,
      id: meta.link,
      link: meta.link,
      date: new Date(meta.updated),
      description: meta.description
    });
  });
  return feed.rss2();
}

export function feedWrite(
  options: FeedOptions,
  metas: MetaData[],
  w: Writable
) {
  w.write(feed(options, metas));
  w.end();
}
