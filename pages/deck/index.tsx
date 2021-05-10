import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Layout from '../../components/Layout';
import ListDeck from '../../components/ListDeck';
// import Typography from '@material-ui/core/Typography';
import { PageData, IndexList } from '../../types/pageTypes';
import { getPagesData, getSortedIndexData } from '../../lib/pages';
import NavPagination from '../../components/NavPagination';
import { GetQuery } from '../../types/client/queryTypes';
import { pageCountFromTotalCount } from '../../utils/pagination';
import { writeFeed } from '../../lib/feed';

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

const DeckPage = ({ pageData, items }: Props) => {
  const classes = useStyles();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      // topSection={
      //   <NavCategory
      //     all
      //     categoryPath="/deck/category"
      //     allCategory={pageData.allCategory}
      //     category={pageData.category}
      //     classes={classes}
      //   />
      // }
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
  q.limit = itemsPerPage;
  if (pageNo !== undefined) {
    q.offset = itemsPerPage * (pageNo - 1);
  }
  if (curCategory) {
    q.filters = `category[contains]${curCategory}`;
  }
  const items = await getSortedIndexData('deck', q);
  console.log(
    await writeFeed(
      {
        id: 'https://hankei6km.github.io/mardock',
        title: 'mardock',
        copyright: ''
      },
      items.contents.map(({ meta }) => meta),
      'deck'
    )
  );
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

export default DeckPage;
