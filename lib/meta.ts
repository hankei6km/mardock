import matter from 'gray-matter';
import { PageData, MetaData } from '../types/pageTypes';
import { getSlidePublicImagePath, getSlidePublicImageFilename } from './slide';
import { ApiNameArticle } from '../types/apiName';

// https://github.com/marp-team/marp-cli#metadata
const metaDeckKeys = ['title', 'description', 'url', 'image'];
type metaPageOpts = { apiName: ApiNameArticle } & Pick<
  PageData,
  'id' | 'title' | 'articleTitle' | 'mainVisual' | 'description' | 'deck'
>;

function baseUrl(): string {
  console.log(process.env.GITHUB_REPOSITORY);
  const [githubUser, githubRepo] = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.split('/', 2)
    : ['', ''];
  if (githubUser) {
    return `https://${githubUser}.github.io/${githubRepo}`;
  }
  return '';
}

export function metaOpen(source: string): { [key: string]: any } {
  const s = matter(source);
  return s.data ? { ...s.data } : {};
}

export function metaDeck(source: string) {
  const ret: { [key: string]: string } = {};
  Object.entries(metaOpen(source)).forEach(([k, v]) => {
    if (metaDeckKeys.findIndex((n) => k === n) >= 0) {
      if (typeof v === 'string') {
        ret[k] = v;
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
  return {
    title: opts.deck.slide.meta.title || opts.articleTitle,
    keyword: [],
    image,
    description: opts.deck.slide.meta.description || opts.description
  };
}
