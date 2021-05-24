// import React, { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
// import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import LayoutDocs from '../../components/LayoutDocs';
import ListDocs from '../../components/ListDocs';
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
    <LayoutDocs
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
        ) : undefined
      }
      bottomSection={
        <section>
          <ListDocs itemPath={'/docs'} items={items} />
        </section>
      }
    ></LayoutDocs>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getAllPagesIds('docs')).map((id) => ({
    params: { id }
  }));
  return {
    paths,
    fallback: process.env.STATIC_BUILD ? false : true
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
