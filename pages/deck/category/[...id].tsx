import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../../../components/Layout';
// import Link from '../../../components/Link';
import List from '../../../components/List';
import { PageData } from '../../../types/pageTypes';
import {
  getPagesData,
  getSortedPagesData,
  getAllCategolizedPaginationIds
} from '../../../lib/pages';
import { PagesList } from '../../../types/client/contentTypes';
import NavPagination from '../../../components/NavPagination';
import { GetQuery } from '../../../types/client/queryTypes';
// import classes from '*.module.css';

// const useStyles = makeStyles(() => ({}));

const itemsPerPage = 10;
const pagePath: string[] = [];

type Props = {
  pageData: PageData;
  items: PagesList;
};

// このページは /pages/posts/index.tsx とほぼ同じ.
// (category では [...id].tsx で同じファイルで処理できている)
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
        <List itemPath={'/deck'} items={items} cols={[1, 1]} imgWidth={600} />
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
    'pages',
    {
      ...context,
      params: { id: 'deck' }
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
  const items = await getSortedPagesData('deck', q);
  return { props: { pageData, items } };
};
