import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
// import { makeStyles } from '@material-ui/core';
import LayoutSlide from '../../components/LayoutSlide';
import { SlideData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesSlideData } from '../../lib/pages';

type Props = {
  slideData: SlideData;
};

export default function Deck({ slideData }: Props) {
  // const classes = useStyles();
  if (slideData === undefined || slideData.body.length === 0) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <LayoutSlide
      {...slideData}
      notification={slideData.notification}
    ></LayoutSlide>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getAllPagesIds('deck')).map((id) => ({
    params: { id }
  }));
  return {
    paths,
    fallback: process.env.STATIC_BUILD ? false : true
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slideData = await getPagesSlideData('deck', context);
  return {
    props: {
      slideData
    }
  };
};
