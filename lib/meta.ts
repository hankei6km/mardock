import { join } from 'path';
import matter from 'gray-matter';
import { PageData, MetaData } from '../types/pageTypes';
import { getSlidePublicImagePath, getSlidePublicImageFilename } from './slide';
import { ApiNameArticle } from '../types/apiName';

// https://github.com/marp-team/marp-cli#metadata
const metaDeckKeys = ['title', 'description', 'url', 'image'];
type metaPageOpts = { apiName: ApiNameArticle } & Pick<
  PageData,
  | 'id'
  | 'updated'
  | 'title'
  | 'articleTitle'
  | 'mainVisual'
  | 'description'
  | 'deck'
>;

function baseUrl(): string {
  const [githubUser, githubRepo] = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.split('/', 2)
    : ['', ''];
  if (githubUser) {
    const baseUrl = process.env.STAGING_DIR
      ? join(githubRepo, process.env.STAGING_DIR)
      : githubRepo;
    return `https://${githubUser}.github.io/${baseUrl}`;
  }
  return '';
}

export type MetaCommonResult = {
  errMessage: string;
  data: { [key: string]: any };
};

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
  let image = opts.deck.slide.meta.image || '';
  if (image === '') {
    image = opts.mainVisual.url;
    if (opts.apiName === 'deck') {
      image =
        baseUrl() +
        getSlidePublicImagePath(getSlidePublicImageFilename(opts.id));
    }
  }
  let link = baseUrl() + join('/', opts.apiName, opts.id); // TODO: baseUrl が '' のときの対応
  return {
    title: opts.deck.slide.meta.title || opts.articleTitle,
    link,
    updated: opts.updated,
    keyword: [],
    image,
    description: opts.deck.slide.meta.description || opts.description
  };
}
