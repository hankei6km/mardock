import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../../components/Layout';
import List from '../../components/List';
// import Typography from '@material-ui/core/Typography';
import { PagesList } from '../../types/client/contentTypes';
import { PageData } from '../../types/pageTypes';
import { getSortedPagesData, getPagesData } from '../../lib/pages';

// const useStyles = makeStyles(() => ({}));

type Props = {
  pageData: PageData;
  items: PagesList;
};

const DeckPage = ({ pageData, items }: Props) => {
  // const classes = useStyles();
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
        <List items={items} cols={[1, 1]} imgWidth={600} />
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('pages', {
    ...context,
    params: { id: 'deck' }
  });
  const items = await getSortedPagesData('deck');
  return { props: { pageData, items } };
};

export default DeckPage;
