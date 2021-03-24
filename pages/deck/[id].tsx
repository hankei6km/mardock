// import React, { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
// import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Layout from '../../components/Layout';
import Link from '../../components/Link';
import Carousel from 'react-material-ui-carousel';
import { PageData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesData } from '../../lib/pages';

type Props = {
  pageData: PageData;
};

export default function Deck({ pageData }: Props) {
  // const classes = useStyles();
  // const router = useRouter();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout apiName={'deck'} {...pageData} notification={pageData.notification}>
      <Box component="section">
        <style
          dangerouslySetInnerHTML={{
            __html: pageData.deck.css
          }}
        />
        <Carousel autoPlay={false} animation={'slide'}
        // 2.2.x だと NavButton が常に表示か非表示にしかできない?
        >
          {pageData.deck.items.map(({ html }, i) => (
            <article id="presentation" key={i}>
              <div className="slides">
                <div
                  className="slide"
                  dangerouslySetInnerHTML={{
                    __html: html
                  }}
                />
              </div>
            </article>
          ))}
        </Carousel>
        <Link href="/slides[id]" as={`/slides/${pageData.id}`}>
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
  return {
    props: {
      pageData
    }
  };
};
