import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { join } from 'path';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Layout from '../../components/Layout';
import Link from '../../components/Link';
import { PageData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesData } from '../../lib/pages';

type Props = {
  pageData: PageData;
  slideHtml?: string;
  slidePdf?: string;
};

export default function Deck({ pageData }: Props) {
  // const classes = useStyles();
  const router = useRouter();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  const mainVisualUrl = pageData.mainVisual.url.startsWith('/')
    ? join(router.basePath, pageData.mainVisual.url)
    : pageData.mainVisual.url;
  const mainVisualWidth =
    pageData.mainVisual.width > pageData.mainVisual.height
      ? 500
      : (pageData.mainVisual.width * 500) / pageData.mainVisual.height;
  const mainVisualHeight =
    pageData.mainVisual.height > pageData.mainVisual.width
      ? 500
      : (pageData.mainVisual.height * 500) / pageData.mainVisual.width;
  return (
    <Layout apiName={'deck'} {...pageData} notification={pageData.notification}>
      <Box component="section">
        <Link href="/slides[id]" as={`/slides/${pageData.id}`}>
          {mainVisualUrl && (
            <Box>
              <img
                src={mainVisualUrl}
                width={mainVisualWidth}
                height={mainVisualHeight}
                alt="slide thmubnail"
              />
            </Box>
          )}
          {'Open presentation'}
        </Link>
      </Box>
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
    fallback: process.env.USE_FALLBACK ? true : false
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('deck', context);
  const slidePath = ''; //slidePathBaseName(pageData.id);
  const slidePathHtml = `${slidePath}.html`;
  return {
    props: {
      pageData,
      slideHtml: slidePathHtml,
      slidePdf: `${slidePath}.pdf`
    }
  };
};
