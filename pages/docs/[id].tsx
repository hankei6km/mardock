// import React, { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
// import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Layout from '../../components/Layout';
import ListDocs from '../../components/ListDocs';
import Link from '../../components/Link';
import NavHtmlToc from '../../components/NavHtmlToc';
import { PageData, IndexList } from '../../types/pageTypes';
import { GetQuery } from '../../types/client/queryTypes';
import {
  getSortedIndexData,
  getAllPagesIds,
  getPagesData
} from '../../lib/pages';

const itemsPerPage = 10;

type Props = {
  pageData: PageData;
  items: IndexList;
};

export default function Docs({ pageData, items }: Props) {
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
      bottomSection={
        <section>
          <ListDocs itemPath={'/docs'} items={items} />
        </section>
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
  const pageNo = 1;
  const curCategory = '';
  const pageData = await getPagesData('docs', context);
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
  const items = await getSortedIndexData('docs', q);
  return { props: { pageData, items } };
};
