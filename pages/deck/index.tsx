import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { makeStyles } from '@material-ui/core';
import Layout from '../../components/Layout';
import List from '../../components/List';
// import Typography from '@material-ui/core/Typography';
import { PageData, IndexList } from '../../types/pageTypes';
import { getPagesData, getSortedIndexData } from '../../lib/pages';
import NavPagination from '../../components/NavPagination';
import { GetQuery } from '../../types/client/queryTypes';
import NavCategory from '../../components/NavCategory';

const useStyles = makeStyles(() => ({
  'NavCategory-all-list': {
    display: 'block',
    listStyle: 'none',
    '& li::before': {
      content: '\u200B'
    }
  }
}));

const itemsPerPage = 10;
const pagePath: string[] = [];

type Props = {
  pageData: PageData;
  items: IndexList;
};

const DeckPage = ({ pageData, items }: Props) => {
  const classes = useStyles();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      topSection={
        <NavCategory
          all
          categoryPath="/deck/category"
          allCategory={pageData.allCategory}
          category={pageData.category}
          classes={classes}
        />
      }
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
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageNo = 1;
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

export default DeckPage;
