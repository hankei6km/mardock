// import React, { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
// import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../../components/Layout';
import Link from '../../components/Link';
import NavHtmlToc from '../../components/NavHtmlToc';
import { PageData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesData } from '../../lib/pages';

type Props = {
  pageData: PageData;
};

export default function Docs({ pageData }: Props) {
  // const classes = useStyles();
  // const router = useRouter();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'docs'}
      {...pageData}
      notification={pageData.notification}
      topPersistSection={
        pageData.htmlToc.items.length > 1 ? (
          <aside>
            <section>
              <NavHtmlToc htmlToc={pageData.htmlToc} />
            </section>
          </aside>
        ) : (
          ''
        )
      }
    >
      <Link href="/docs">{'Back to Docs'}</Link>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getAllPagesIds('docs')).map((id) => ({
    params: { id }
  }));
  return {
    paths,
    fallback: process.env.USE_FALLBACK ? true : false
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageData = await getPagesData('docs', context);
  return {
    props: {
      pageData
    }
  };
};
