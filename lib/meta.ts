import { join } from 'path';
import matter from 'gray-matter';
import { PageData, MetaData, DeckData } from '../types/pageTypes';
import siteServerSideConfig from '../src/site.server-side-config';
import { getSlidePublicFilePath, getSlidePublicImageFilename } from './slide';
import { ApiNameArticle } from '../types/apiName';

// https://github.com/marp-team/marp-cli#metadata
const metaDeckKeys = ['title', 'description', 'url', 'image'];
type metaPageOpts = { apiName: ApiNameArticle } & Pick<
  PageData,
  'id' | 'updated' | 'title' | 'articleTitle' | 'mainVisual' | 'description'
> & { deck: DeckData };

export type MetaCommonResult = {
  errMessage: string;
  data: { [key: string]: any };
};

export function getBaseUrl(): string {
  return siteServerSideConfig.baseUrl;
}

export function metaOpen(source: string): MetaCommonResult {
  const ret: MetaCommonResult = {
    errMessage: '',
    data: {}
  };
  try {
    // https://github.com/jonschlinkert/gray-matter/issues/43
    // https://github.com/jonschlinkert/gray-matter/issues/106
    const s = matter(source, {});
    ret.data = s.data ? { ...s.data } : {};
  } catch (err) {
    ret.errMessage = `${err}`;
  }
  return ret;
}

export function metaDeck(source: string): MetaCommonResult {
  const ret: MetaCommonResult = { errMessage: '', data: {} };
  const m = metaOpen(source);
  ret.errMessage = m.errMessage;
  Object.entries(m.data).forEach(([k, v]) => {
    if (metaDeckKeys.findIndex((n) => k === n) >= 0) {
      if (typeof v === 'string') {
        ret.data[k] = v;
      }
    }
  });
  return ret;
}

export function metaPage(opts: metaPageOpts): MetaData {
  let image = opts.deck.meta.image || '';
  if (image === '') {
    image = opts.mainVisual.url;
    if (opts.apiName === 'deck') {
      image =
        getBaseUrl() +
        getSlidePublicFilePath(
          opts.id,
          opts.deck.hash,
          getSlidePublicImageFilename(opts.id)
        );
    }
  }
  let link = getBaseUrl() + join('/', opts.apiName, opts.id); // TODO: getBaseUrl が '' のときの対応
  return {
    title: opts.deck.meta.title || opts.articleTitle,
    link,
    updated: opts.updated,
    keyword: [],
    image,
    description: opts.deck.meta.description || opts.description
  };
}
