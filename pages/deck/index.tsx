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
import siteConfig from '../../src/site.config';
import siteServerSideConfig from '../../src/site.server-side-config';
import { buildAssets } from '../../utils/assets';

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
  feedUrl: string;
};

const DeckPage = ({ pageData, items, feedUrl }: Props) => {
  const classes = useStyles();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      {...pageData}
      notification={pageData.notification}
      feedUrl={feedUrl}
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
  // プレビューで除外
  let feedUrl = '';
  if (
    buildAssets(
      process.env.BUILD_ASSETS_FEEDS || '',
      process.env.STATIC_BUILD || '',
      context.preview || false
    )
  ) {
    feedUrl = await writeFeed(
      {
        id: siteServerSideConfig.baseUrl,
        link: siteServerSideConfig.baseUrl,
        title: siteConfig.siteName,
        copyright: siteConfig.siteFeedTitle
      },
      items.contents.map(({ meta }) => meta),
      'deck'
    );
  }
  return {
    props: {
      pageData: {
        ...pageData,
        pageCount: pageCountFromTotalCount(items.totalCount, itemsPerPage)
      },
      items,
      feedUrl
    }
  };
};

export default DeckPage;
