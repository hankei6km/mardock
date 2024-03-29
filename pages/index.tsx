import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/Layout';
import Link from '../components/Link';
import ListDeck from '../components/ListDeck';
import NavHtmlToc from '../components/NavHtmlToc';
// import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { PageData, IndexList } from '../types/pageTypes';
import { getPagesData, getSortedIndexData } from '../lib/pages';
import { GetQuery } from '../types/client/queryTypes';

const itemsPerPage = 12;

const useStyles = makeStyles((theme) => ({
  'ListDeck-outer': {
    marginBottom: theme.spacing(2)
  },
  'ListDeck-recent-title': {
    margin: theme.spacing(3, 0)
  },
  'MoreListDeck-outer': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  },
  MoreListDeck: {
    width: '100%',
    '& span': {
      //   ...theme.typography.body1,
      color: theme.palette.primary.contrastText
    }
  },
  'JumpToListDeck-outer': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  },
  JumpToListDeck: {
    width: '100%',
    '& span': {
      //   ...theme.typography.body1,
      color: theme.palette.primary.contrastText
    }
  }
}));

type Props = {
  pageData: PageData;
  intro: IndexList;
  items: IndexList;
};

const IndexPage = ({ pageData, intro, items }: Props) => {
  const classes = useStyles();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      {...pageData}
      notification={pageData.notification}
      topPersistSection={
        pageData.htmlToc.items.length > 1 ? (
          <aside>
            <section>
              <NavHtmlToc htmlToc={pageData.htmlToc} />
            </section>
          </aside>
        ) : undefined
      }
      bottomSection={
        <section>
          <Typography
            component="h2"
            variant="h5"
            className={classes['ListDeck-recent-title']}
          >
            最近のスライド
          </Typography>
          <Box className={classes['ListDeck-outer']}>
            <ListDeck itemPath={'/deck'} items={items} variant="thin" />
          </Box>
          {items.totalCount > itemsPerPage && (
            <Box className={`${classes['MoreListDeck-outer']}`}>
              <Button
                component={Link}
                href="/deck/page/2"
                startIcon={<ExpandMoreIcon />}
                className={`MuiButton-containedPrimary ${classes['MoreListDeck']}`}
              >
                <Typography component="span">続きを表示</Typography>
              </Button>
            </Box>
          )}
        </section>
      }
    >
      <section>
        <Box className={classes['ListDeck-outer']}>
          <ListDeck itemPath={'/deck'} items={intro} variant="cover" />
        </Box>
        <Box className={`${classes['JumpToListDeck-outer']}`}>
          <Button
            component={Link}
            href="/deck"
            startIcon={<ExpandMoreIcon />}
            className={`MuiButton-containedPrimary ${classes['JumpToListDeck']}`}
          >
            <Typography component="span">スライド一覧を表示</Typography>
          </Button>
        </Box>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('pages', {
    ...context,
    params: { id: 'home' }
  });
  const intro = await getSortedIndexData('deck', {
    filters: 'id[equals]mardock-intro'
  });
  const q: GetQuery = {};
  q.limit = itemsPerPage;
  const items = await getSortedIndexData('deck', q);
  return {
    props: {
      pageData,
      intro,
      items
    }
  };
};

export default IndexPage;
