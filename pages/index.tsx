import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../components/Layout';
import ListDeck from '../components/ListDeck';
import NavHtmlToc from '../components/NavHtmlToc';
// import Typography from '@material-ui/core/Typography';
import { PageData, IndexList } from '../types/pageTypes';
import { getPagesData, getSortedIndexData } from '../lib/pages';

type Props = {
  pageData: PageData;
  items: IndexList;
};

const IndexPage = ({ pageData, items }: Props) => {
  // const classes = useStyles();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      {...pageData}
      notification={pageData.notification}
      topSection={
        pageData.htmlToc.items.length > 1 ? (
          <NavHtmlToc htmlToc={pageData.htmlToc} />
        ) : (
          ''
        )
      }
    >
      <section>
        <ListDeck itemPath={'/deck'} items={items} />
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('pages', {
    ...context,
    params: { id: 'home' }
  });
  const items = await getSortedIndexData('deck', {
    // filters: 'displayOnIndexPage[equals]true'
  });
  return { props: { pageData, items } };
};

export default IndexPage;
