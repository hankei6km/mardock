import React, { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { makeStyles } from '@material-ui/core/styles';
// import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
// import Pagination from '@material-ui/lab/Pagination';
// import PaginationItem from '@material-ui/lab/PaginationItem';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
// import TimelineDot from '@material-ui/lab/TimelineDot';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LayoutDeck from '../../components/LayoutDeck';
import Link from '../../components/Link';
import Carousel from 'react-material-ui-carousel';
import SlideshowIcon from '@material-ui/icons/Slideshow';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { PageData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesData } from '../../lib/pages';
import { writeSlideTitleImage, writeSlidePdf } from '../../lib/slide';
import NavCategory from '../../components/NavCategory';
// import ListDeck from '../../components/ListDeck';

const useStyles = makeStyles((theme) => ({
  'Page-root': {
    display: 'block',
    backgroundColor: theme.palette.content.background.default.main,
    // borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      padding: theme.spacing(2)
    }
  },
  'DeckInfo-root': {
    ...theme.typography.body1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(0, 3, 2, 3)
    }
  },
  'DeckInfo-header': {
    // ...theme.typography.body1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    margin: theme.spacing(0, 0, 1, 0),
    '& h2': {
      ...theme.typography.h5
    },
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'center'
    }
  },
  'DeckInfo-toggle-button': {
    display: 'block',
    transform: 'rotate(0deg)',
    '&:not(.Deckinfo-menu-expanded)': {
      transform: 'rotate(270deg)'
    },
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  'DeckInfo-header-title': {
    ...theme.typography.body1
  },
  'DeckInfo-Buttons-outer': {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: theme.spacing(1),
    '& .MuiButton-root:not(:last-child)': {
      marginBottom: theme.spacing(1)
    }
    // [theme.breakpoints.up('sm')]: {
    //   display: 'flex',
    //   flexDirection: 'row',
    //   justifyContent: 'center',
    //   '& .MuiButton-root': {
    //     minWidth: '12em',
    //     marginBottom: theme.spacing(1)
    //   },
    //   '& .MuiButton-root:not(:last-child)': {
    //     marginRight: theme.spacing(1)
    //   }
    // }
  },
  DeckInfo: {
    maxWidth: theme.breakpoints.values.md,
    width: '100%',
    overflow: 'hidden',
    transition: 'max-height .5s',
    maxHeight: 500,
    '&:not(.DeckInfo-Open)': {
      maxHeight: 0
    },
    [theme.breakpoints.up('sm')]: {
      '&:not(.DeckInfo-Open)': {
        maxHeight: 'unset'
      }
    }
  },
  'DeckInfo-author-comment': {
    marginBottom: theme.spacing(1)
  },
  'DeckInfo-Category-outer': {
    marginBottom: theme.spacing(1)
  },
  'ListDeck-root': {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.content.background.deck.main
  },
  'Control-Nav': {
    //width: '100%',
    '& .MuiPagination-ul': {
      justifyContent: 'center'
    }
  },
  'Deck-overview-root': {
    width: '100%',
    '& .MuiTimelineItem-missingOppositeContent:before': {
      flex: 'unset',
      padding: 0
    },
    '& .MuiAvatar-root': {
      margin: theme.spacing(1, 0)
    }
  },
  'DeckInfo-overview-title': {
    // ...theme.typography.body1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing(1),
    ...theme.typography.h6,
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'center'
    }
  }
}));

type Props = {
  pageData: PageData;
  comment: string;
  pdfPath: string;
  // items: IndexList;
};

export default function Deck({ pageData, comment, pdfPath }: Props) {
  const classes = useStyles();
  const [navOpen, setNavOpen] = useState(false);
  // const router = useRouter();
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <LayoutDeck
      apiName={'deck'}
      {...pageData}
      bottomSection={
        <>
          <Box component="section" className={classes['DeckInfo-root']}>
            <Box component="h2" className={classes['DeckInfo-header']}>
              <IconButton
                aria-label="toggle deck info area"
                className={`${classes['DeckInfo-toggle-button']}${
                  navOpen ? 'Deckinfo-menu-expanded' : ''
                }`}
                onClick={() => setNavOpen(!navOpen)}
              >
                <ExpandMoreIcon />
              </IconButton>
              <Typography className={classes['DeckInfo-header-title']}>
                スライド概要
              </Typography>
            </Box>
            <aside
              className={`${classes['DeckInfo']}${
                navOpen ? ' DeckInfo-Open' : ''
              }`}
            >
              <Box className={classes['DeckInfo-Buttons-outer']}>
                <Button
                  className="MuiButton-outlinedPrimary"
                  //variant="outlined"
                  component={Link}
                  href="/slides[id]"
                  as={`/slides/${pageData.id}`}
                  startIcon={<SlideshowIcon />}
                  color="primary"
                >
                  プレゼンテーション
                </Button>
                <Button
                  className="MuiButton-outlinedSecondary"
                  component={Link}
                  href={pdfPath}
                  startIcon={<PictureAsPdfIcon />}
                  color="secondary"
                >
                  PDF ダウンロード
                </Button>
              </Box>
              <div>
                <article
                  className={classes['DeckInfo-author-comment']}
                  title="author comment"
                  dangerouslySetInnerHTML={{
                    __html: comment
                  }}
                />
                <Box className={classes['DeckInfo-Category-outer']}>
                  <NavCategory
                    categoryPath={'/deck/category'}
                    allCategory={pageData.allCategory}
                    category={pageData.category}
                  />
                </Box>
              </div>
            </aside>
            <Timeline className={classes['Deck-overview-root']}>
              {pageData.deck.items.map(({ html }, i, items) => (
                <TimelineItem key={i}>
                  <TimelineSeparator>
                    <Avatar>
                      <Typography>{`${i + 1}`}</Typography>
                    </Avatar>
                    {i + 1 < items.length && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <article id={pageData.deck.id}>
                      <div className="slides">
                        <div
                          className="slide"
                          dangerouslySetInnerHTML={{
                            __html: html
                          }}
                        />
                      </div>
                    </article>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        </>
      }
      // bottomSection={
      //   <section>
      //     <Typography component="h2">slides list</Typography>
      //     <ListDeck
      //       itemPath={'/deck'}
      //       items={items}
      //       variant="thin"
      //       // classes={classes}
      //     />
      //   </section>
      // }
      notification={pageData.notification}
    >
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: pageData.deck.css
          }}
        />
        <Box className={classes['Page-root']}>
          <Carousel
            autoPlay={false}
            animation={'slide'}
            // indicators={false}
            // 2.2.x だと NavButton が常に表示か非表示にしかできない?
          >
            {pageData.deck.items.map(({ html }, i) => (
              <article id={pageData.deck.id} key={i}>
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
        </Box>
      </>
    </LayoutDeck>
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
  const { html, ...others } = await getPagesData('deck', context);
  // const items = await getSortedIndexData('deck', {
  // filters: 'displayOnIndexPage[equals]true'
  // });
  // 画像作成、ここで作成するのは最適?
  await writeSlideTitleImage(others.deck.source, context.params?.id as string);
  const pdfPath = await writeSlidePdf(
    others.deck.source,
    context.params?.id as string
  );
  return {
    props: {
      pageData: { ...others },
      comment: html,
      pdfPath
      //items
    }
  };
};
