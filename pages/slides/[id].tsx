import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../../components/Layout';
import Link from '../../components/Link';
import { SlideData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesData } from '../../lib/pages';
import { slidePathBaseName, slideWriteHtmlTo } from '../../lib/slide';

type Props = {
  pageData: SlideData;
};

export default function Deck({ pageData }: Props) {
  // const classes = useStyles();
  if (pageData === undefined || !pageData.body) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout apiName={'deck'} {...pageData} notification={pageData.notification}>
      <Link href="/">{'Back to Home'}</Link>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getAllPagesIds('deck')).map((id) => ({
    params: { id }
  }));
  return {
    paths,
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('deck', context);
  return {
    props: {
      pageData
    }
  };
};
