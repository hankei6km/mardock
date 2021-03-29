import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../../../components/Layout';
// import Link from '../../../components/Link';
import ListDeck from '../../../components/ListDeck';
import { PageData, IndexList } from '../../../types/pageTypes';
import {
  getPagesData,
  getAllCategolizedPaginationIds,
  getSortedIndexData
} from '../../../lib/pages';
import NavPagination from '../../../components/NavPagination';
import { GetQuery } from '../../../types/client/queryTypes';
// import classes from '*.module.css';

// const useStyles = makeStyles(() => ({}));

const itemsPerPage = 10;
const pagePath: string[] = [];

type Props = {
  pageData: PageData;
  items: IndexList;
};

// このページは /deck/posts/index.tsx とほぼ同じ.
// (category ではで index と id の扱いを [...id].tsx で処理できている)
export default function Page({ pageData, items }: Props) {
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      {...pageData}
      notification={pageData.notification}
    >
      <section>
        <ListDeck
          itemPath={'/deck'}
          items={items}
          cols={[1, 1]}
          imgWidth={600}
        />
        <NavPagination
          pageNo={pageData.pageNo}
          pageCount={pageData.pageCount}
          curCategory={pageData.curCategory}
          paginationHref={'/deck/page/[..id]'}
          paginationBaseAs={'/deck/page'}
          paginationPagePath={pagePath}
          paginationFirstPageHref={'/deck'}
        />
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const category = (
    await getPagesData('pages', {
      params: { id: 'deck' }
    })
  ).allCategory.map(({ id }) => id);
  const paths = (
    await getAllCategolizedPaginationIds(
      'deck',
      category,
      itemsPerPage,
      pagePath
    )
  ).map((id) => ({
    params: { id: id }
  }));

  return {
    paths,
    fallback: process.env.USE_FALLBACK ? true : false
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  // /path/to/category/[id as cat][id as 'page'][id] となっているので、そのように分割.
  // ユーティリティにすることも考える?
  const id = context.params?.id || [''];
  const idLen = id.length;
  const pageNo = idLen > 1 ? parseInt(id[idLen - 1], 10) : 1;
  const curCategory = id[0];
  const pageData = await getPagesData(
    'category',
    {
      ...context,
      params: { id: curCategory }
    },
    {
      pageNo,
      curCategory,
      itemsPerPage
    }
  );
  const q: GetQuery = {};
  if (itemsPerPage !== undefined) {
    q.limit = itemsPerPage;
    if (pageNo !== undefined) {
      q.offset = itemsPerPage * (pageNo - 1);
    }
  }
  if (curCategory) {
    q.filters = `category[contains]${curCategory}`;
  }
  const items = await getSortedIndexData('deck', q);
  return { props: { pageData, items } };
};
