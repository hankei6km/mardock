import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import Package from '../package.json';
// import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/Layout';
import Link from '../components/Link';
import { PageData } from '../types/pageTypes';
import { getPagesData } from '../lib/pages';
import AboutLicense from '../src/aboutLicense';

const [licenseName, cpoyright, licenseLines] = ((): [
  string,
  string,
  string[]
] => {
  const l = AboutLicense()
    .split('\n')
    .filter((e) => e.length > 0);
  return [l[0], l[1], l.slice(2)];
})();

type Props = {
  pageData: PageData;
};
const AboutPage = ({ pageData }: Props) => {
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      {...pageData}
      notification={pageData.notification}
    >
      <>
        <Box py={1}>
          <Typography>{Package.version}</Typography>
        </Box>
        <Box py={1}>
          <Link variant="button" href="/open_source_licenses.zip">
            Open Source Licenses
          </Link>
        </Box>
        <Box>
          <Typography component="h3" variant="h5">
            {licenseName}
          </Typography>
          <Typography variant="body1" paragraph>
            {cpoyright}
          </Typography>
          {licenseLines.map((v, i) => (
            <Box key={i}>
              <Typography variant="body2" paragraph>
                {v}
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('pages', {
    ...context,
    params: { id: 'about' }
  });
  return { props: { pageData } };
};

export default AboutPage;
