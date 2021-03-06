import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Layout from '../../../components/Layout';
// import Link from '../../../components/Link';
import ListDeck from '../../../components/ListDeck';
import { PageData, IndexList } from '../../../types/pageTypes';
import {
  getPagesData,
  getSortedIndexData,
  getAllPaginationIds
} from '../../../lib/pages';
import NavPagination from '../../../components/NavPagination';
import { GetQuery } from '../../../types/client/queryTypes';
import { pageCountFromTotalCount } from '../../../utils/pagination';
// import classes from '*.module.css';

const itemsPerPage = 12;
const pagePath: string[] = [];

const useStyles = makeStyles((theme) => ({
  'ListDeck-outer': {
    marginBottom: theme.spacing(2)
  }
}));

type Props = {
  pageData: PageData;
  items: IndexList;
};

// このページは /pages/posts/index.tsx とほぼ同じ.
// (category では [...id].tsx で同じファイルで処理できている)
export default function Page({ pageData, items }: Props) {
  const classes = useStyles();
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
        <Box className={classes['ListDeck-outer']}>
          <ListDeck itemPath={'/deck'} items={items} imgWidth={600} />
        </Box>
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
    fallback: process.env.STATIC_BUILD ? false : true
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
  const q: GetQuery = {};
  q.limit = itemsPerPage;
  if (pageNo !== undefined) {
    q.offset = itemsPerPage * (pageNo - 1);
  }
  if (curCategory) {
    q.filters = `category[contains]${curCategory}`;
  }
  const items = await getSortedIndexData('deck', q);
  return {
    props: {
      pageData: {
        ...pageData,
        pageCount: pageCountFromTotalCount(items.totalCount, itemsPerPage)
      },
      items
    }
  };
};
