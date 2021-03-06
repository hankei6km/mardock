// import { Writable } from 'stream';
import { ParsedUrlQuery } from 'querystring';
import { GetStaticPropsContext } from 'next';
import client, { fetchConfig } from './client';
import {
  PagesList,
  PagesIds,
  // PagesContent,
  blankPagesList
  // blankPageContent
} from '../types/client/contentTypes';
import { GetQuery, GetContentQuery } from '../types/client/queryTypes';
import {
  Notification,
  PageData,
  blankPageData,
  IndexData,
  blankIndexData,
  IndexList,
  blankIndexList
} from '../types/pageTypes';
import siteServerSideConfig from '../src/site.server-side-config';
import { applyPreviewDataToIdQuery, PreviewData } from './preview';
import { getArticleData, getArticleDataFromContent } from './html';
import { draftLint } from './draftlint';
import { rewrite, rewriteEmbed, rewriteImg } from './rewrite';
import { ApiNameArticle } from '../types/apiName';
import {
  paginationIdsFromPageCount,
  pageCountFromTotalCount
} from '../utils/pagination';
import {
  slideDeckSlide,
  slideDeckIndex,
  slideDeckRemoveId,
  slideDeckOverview,
  getSlideHtmlWithHash
} from './slide';
import { htmlToMarkdown, sourceSetMarkdown } from './source';
import { metaPage } from './meta';
// import { getTextlintKernelOptions } from '../utils/textlint';

// const itemsPerPage = 10;

export type PageDataGetOptions = {
  // ページの主題となる一覧を取得する場合に指定(ブログページで posps API を指定するなど)
  // コンテンツ側からは congtentPageArticles として指定する。
  // カテゴリは下記の curCategory が使われる.
  // articlesApi?: ApiNameArticle;
  // route 上で選択されているカテゴリ(page 内の category[] のうちの１つになるはず).
  curCategory?: string;
  // ページング用j
  itemsPerPage?: number;
  pageNo?: number;
};

export async function getSortedPagesData(
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<PagesList> {
  try {
    const res = await client[apiName].get({
      query: {
        ...query,
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourceContents,sourcePages,source,category,mainVisual'
      },
      config: fetchConfig
    });
    return res.body;
  } catch (err) {
    // res.status = 404 などでも throw される(試した限りでは)
    // res.status を知る方法は?
    console.error(`getSortedPagesData error: ${err.name}`);
  }
  return blankPagesList();
}

export async function getSortedIndexData(
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<IndexList> {
  try {
    const res = await client[apiName].get({
      query: {
        ...query,
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourceContents,sourcePages,source,category,mainVisual'
      },
      config: fetchConfig
    });
    const p = res.body.contents.map((res) => {
      return async (): Promise<IndexData> => {
        // ここでは res.content は html として扱う
        const { articleTitle } = getArticleData(res.title, res.content || '');
        const mainVisual = res.mainVisual?.url
          ? res.mainVisual
          : siteServerSideConfig.mainVisual.fallbackImage;
        const ret = {
          ...blankIndexData(),
          id: res.id,
          updated: res.updatedAt,
          title: res.title,
          category: apiName !== 'pages' ? res.category || [] : [],
          articleTitle,
          mainVisual: {
            ...mainVisual
          },
          description: res.description || ''
        };
        let hash = '';
        if (res.source || res.sourceContents || res.sourcePages) {
          const source = await sourceSetMarkdown({
            sourceContents: res.sourceContents,
            sourcePages: res.sourcePages,
            source: res.source
          });
          const d = await slideDeckIndex(res.id, source);
          d.items = d.items.map((v) => ({
            ...v,
            html: slideDeckRemoveId(v.html)
          }));
          ret.deck = d;
          hash = await getSlideHtmlWithHash(source);
        }
        ret.meta = metaPage({ apiName, ...ret, hash });
        return ret;
      };
    });
    return {
      ...res.body,
      contents: await Promise.all(p.map((p) => p()))
    };
  } catch (err) {
    // res.status = 404 などでも throw される(試した限りでは)
    // res.status を知る方法は?
    console.error(`getSortedPagesData error: ${err.name}`);
  }
  return blankIndexList();
}

export async function getPagesIdsList(
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<PagesIds> {
  try {
    const res = await client[apiName].get({
      query: {
        ...query,
        fields: 'id'
      },
      config: fetchConfig
    });
    return res.body;
  } catch (err) {
    console.error(`getPagesIdsList error: ${err.name}`);
  }
  return blankPagesList();
}

export async function getAllPagesIds(
  apiName: ApiNameArticle,
  query: GetQuery = {}
) {
  try {
    return (
      await getPagesIdsList(apiName, {
        ...query,
        limit:
          query.limit !== undefined
            ? query.limit
            : siteServerSideConfig.allIdsLimit
      })
    ).contents.map(({ id }) => id);
  } catch (err) {
    console.error(`getAllPagesIds error: ${err.name}`);
  }
  return [];
}

export async function getAllPaginationIds(
  apiName: ApiNameArticle,
  itemsPerPage: number,
  pagePath: string[] = [],
  query: GetQuery = {}
): Promise<string[][]> {
  try {
    const idsList = await getPagesIdsList(apiName, { ...query, limit: 0 });
    return paginationIdsFromPageCount(
      pageCountFromTotalCount(idsList.totalCount, itemsPerPage),
      pagePath
    );
  } catch (err) {
    console.error(`getAllPagesIdsPageCount error: ${err.name}`);
  }
  return [];
}

export async function getAllCategolizedPaginationIds(
  apiName: ApiNameArticle,
  category: string[],
  itemsPerPage: number,
  pagePath: string[] = ['page'],
  query: GetQuery = {}
) {
  try {
    let ret: string[][] = category.map((cat) => [cat]);
    // Promis.all だと、各カテゴリの ids をすべて保持しておく瞬間があるのでやめておく.
    // totalCount を使うようにしたので、上記の制約はないが、とりあえずそのまま
    const categoryLen = category.length;
    for (let idx = 0; idx < categoryLen; idx++) {
      const cat = category[idx];
      const ids = await getAllPaginationIds(apiName, itemsPerPage, pagePath, {
        ...query,
        filters: `category[contains]${cat}`
      });
      ret = ret.concat(ids.map((id) => [cat, ...id]));
    }
    return ret;
  } catch (err) {
    console.error(`getAllPagesIdsPageCount error: ${err.name}`);
  }
  return [];
}

export async function getPagesData(
  apiName: ApiNameArticle,
  {
    params = { id: '' },
    preview = false,
    previewData = {}
  }: GetStaticPropsContext<ParsedUrlQuery>,
  options: PageDataGetOptions = {
    itemsPerPage: 10
  }
): Promise<PageData> {
  try {
    const [id, query] = applyPreviewDataToIdQuery<GetContentQuery>(
      preview,
      previewData as PreviewData,
      apiName,
      params.id as string,
      {
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourceContents,sourcePages,source,category,mainVisual,description'
      }
    );
    const res = await client[apiName]._id(id).$get({
      query: query,
      config: fetchConfig
    });
    let content = await htmlToMarkdown(res.content || '');
    let deckSlideSource = await sourceSetMarkdown({
      sourceContents: res.sourceContents,
      sourcePages: res.sourcePages,
      source: res.source
    });
    let deckOverviewSource = '';

    let notification: Notification | undefined = undefined; // スイッチ的に動作するのが面白くない
    if (preview) {
      notification = {
        ...siteServerSideConfig.draft
      };
      {
        const { result, messages, list } = await draftLint(content, '.md', {
          titleSuffix: 'content'
        });
        if (messages.length > 0) {
          content = result;
          notification.messageHtml = `${notification.messageHtml}${list}`;
          notification.serverity = 'warning';
        }
      }
      if (deckSlideSource) {
        const { result, messages, list } = await draftLint(
          deckSlideSource,
          '.md',
          {
            idPrefix: 'deckOverview',
            clobberPrefix: '',
            titleSuffix: 'slide'
          }
        );
        if (messages.length > 0) {
          deckOverviewSource = result;
          notification.messageHtml = `${notification.messageHtml}${list}`;
          notification.serverity = 'warning';
        }
      }
    }
    const { articleTitle, html, htmlToc } = await getArticleDataFromContent(
      res.title,
      content
    );
    const mainVisual = res.mainVisual?.url
      ? res.mainVisual
      : siteServerSideConfig.mainVisual.fallbackImage;
    const ret: PageData = {
      ...blankPageData(),
      id: res.id,
      updated: res.updatedAt,
      title: res.title,
      pageNo: options.pageNo !== undefined ? options.pageNo : 1,
      pageCount: -1, // あとで設定する
      // pages の各ページの category を all category として利用(API コール回数、定義数削減)
      allCategory: apiName === 'pages' ? res.category || [] : [],
      category: apiName !== 'pages' ? res.category || [] : [],
      curCategory: options.curCategory || '',
      articleTitle,
      htmlToc: htmlToc,
      html: await rewrite(html)
        .use(rewriteImg())
        .use(rewriteEmbed())
        // .use(rewriteCode())
        .run(),
      mainVisual: {
        ...mainVisual
      },
      description: res.description || '',
      feedUrl: siteServerSideConfig.globalFeedUrl
    };
    ret.deck.slide = await slideDeckSlide(res.id, deckSlideSource);
    ret.deck.overview = await slideDeckOverview(
      res.id,
      deckOverviewSource || deckSlideSource
    );
    ret.deck.hash = await getSlideHtmlWithHash(deckSlideSource);
    ret.meta = metaPage({
      apiName,
      ...ret,
      deck: ret.deck.slide,
      hash: ret.deck.hash
    });
    if (notification) {
      ret.notification = notification;
    }
    return ret;
  } catch (err) {
    // console.error(`getPagesData error: ${err.name}`);
    console.error(`getPagesData error: ${err}`);
  }
  return blankPageData();
}
