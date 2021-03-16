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
  getAllPaginationIds
} from '../../../lib/pages';
import { PagesList } from '../../../types/client/contentTypes';
import NavPagination from '../../../components/NavPagination';
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
  const paths = (await getAllPaginationIds('deck', itemsPerPage, pagePath)).map(
    (id) => ({
      params: { id: id[0] }
    })
  );
  // console.log('paths');
  // paths.forEach((p) => console.log(p.params));

  return {
    paths,
    fallback: process.env.USE_FALLBACK ? true : false
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = typeof context.params?.id === 'string' ? context.params.id : '';
  const pageNo = id !== '' ? parseInt(id, 10) : 1;
  const curCategory = '';
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
  const items = await getSortedPagesData('deck');
  return { props: { pageData, items } };
};
