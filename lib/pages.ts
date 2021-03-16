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
import { PageData, blankPageData } from '../types/pageTypes';
import { applyPreviewDataToIdQuery } from './preview';
import { getTitleAndContent } from './html';
import { textLintInHtml } from './draftlint';
import {
  rewrite,
  rewriteEmbed,
  rewriteCode,
  rewriteImg,
  rewriteToc
} from './rewrite';
import { ApiNameArticle } from '../types/apiName';
import { getTextlintKernelOptions } from '../utils/textlint';
import {
  paginationIdsFromPageCount,
  pageCountFromTotalCount
} from '../utils/pagination';
// import { getTextlintKernelOptions } from '../utils/textlint';

// id が 1件で 40byte  と想定、 content-length が 5M 程度とのことなので、1000*1000*5 / 40 で余裕を見て決めた値。
const allIdsLimit = 120000;
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

const tocTitleLabel = '目次';

export async function getSortedPagesData(
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<PagesList> {
  try {
    const res = await client[apiName].get({
      query: {
        ...query,
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,markdown,category,mainVisual'
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
        limit: query.limit !== undefined ? query.limit : allIdsLimit
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
      previewData,
      apiName,
      params.id as string,
      {
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,markdown,category,mainVisual,description'
      }
    );
    const res = await client[apiName]._id(id).$get({
      query: query,
      config: fetchConfig
    });
    const { articleTitle, html } = getTitleAndContent(
      res.title,
      res.markdown || ''
    );
    const ret: PageData = {
      ...blankPageData(),
      id: res.id,
      updated: res.updatedAt,
      title: res.title,
      pageNo: options.pageNo !== undefined ? options.pageNo : 1,
      pageCount: -1, // あとで設定する
      allCategory: [],
      category: [],
      curCategory: options.curCategory || '',
      articleTitle,
      markdown: await rewrite(html)
        .use(rewriteImg())
        .use(rewriteToc(tocTitleLabel))
        .use(rewriteEmbed())
        .use(rewriteCode())
        .run(),
      mainVisual: res.mainVisual?.url || '',
      description: res.description || ''
    };
    // params.previewDemo は boolean ではない
    if (preview || params.previewDemo === 'true') {
      ret.notification = {
        title: '[DRAFT]',
        messageHtml: '<p><a href="/api/exit-preview">プレビュー終了</a></p>',
        serverity: 'info'
      };
      const { html, messages, list } = await textLintInHtml(
        ret.markdown,
        params.previewDemo !== 'true'
          ? undefined
          : getTextlintKernelOptions({
              presets: [
                {
                  presetId: 'ja-technical-writing',
                  preset: require('textlint-rule-preset-ja-technical-writing')
                }
              ],
              rules: {
                ruleId: 'ja-space-between-half-and-full-width',
                rule: require('textlint-rule-ja-space-between-half-and-full-width'),
                options: {
                  space: 'always'
                }
              }
            })
      );
      if (messages.length > 0) {
        ret.markdown = html;
        ret.notification.messageHtml = `${ret.notification.messageHtml}${list}`;
        ret.notification.serverity = 'warning';
      }
    }
    return ret;
  } catch (err) {
    // console.error(`getPagesData error: ${err.name}`);
    console.error(`getPagesData error: ${err}`);
  }
  return blankPageData();
}
