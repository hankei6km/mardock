import React, { useEffect, useCallback, useState, KeyboardEvent } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import useMediaQuery from '@material-ui/core/useMediaQuery';
// import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
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
import { appBarHeight } from '../../components/Layout';
import { animateScroll as scroll } from 'react-scroll';
import Link from '../../components/Link';
import Carousel from 'react-material-ui-carousel';
import SlideshowIcon from '@material-ui/icons/Slideshow';
import GetAppIcon from '@material-ui/icons/GetApp';
import { PageData } from '../../types/pageTypes';
import { getAllPagesIds, getPagesData } from '../../lib/pages';
import {
  writeSlideTitleImage,
  writeSlidePdf,
  writeSlidePptx,
  slideCacheSetup
} from '../../lib/slide';
import NavCategory from '../../components/NavCategory';
import ButtonSelect from '../../components/ButtonSelect';
// import ListDeck from '../../components/ListDeck';

const useStyles = makeStyles((theme) => ({
  'Page-root': {
    display: 'block',
    top: appBarHeight + theme.spacing(2),
    backgroundColor: theme.palette.content.background.default.main,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(1, 2)
    },
    [theme.breakpoints.up('md')]: {
      position: 'sticky',
      top: 121,
      padding: theme.spacing(1, 2)
    }
  },
  'Page-paper': {
    padding: theme.spacing(0, 0, 1, 0)
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
    ...theme.typography.h5
  },
  'DeckInfo-Buttons-outer': {
    display: 'flex',
    flexDirection: 'column',
    // flexWrap: 'wrap',
    width: '100%',
    marginBottom: theme.spacing(1),
    '& .MuiButton-root': {
      '&:not(:first-child)': {
        '& span': {
          color: 'inherit'
        }
      },
      '&:not(:last-child)': {
        marginBottom: theme.spacing(1)
      }
    }
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
  'Deck-overview-curPage': { backgroundColor: theme.palette.primary.main },
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
  pptxPath: string;
  // items: IndexList;
};

export default function Deck({ pageData, comment, pdfPath, pptxPath }: Props) {
  const classes = useStyles();
  const theme = useTheme();
  const downLg = useMediaQuery(theme.breakpoints.down('sm'));
  const [navOpen, setNavOpen] = useState(false);
  // (index を 1 つにまとめるとボタンのダブルクリックなどでループになる)
  const [curPageIdx, setCurPageIdx] = useState(0); // 変更する index
  const [pageIdx, setPageIdx] = useState(0); // 変更された index
  const [pageSwitched, setPageSwitched] = useState(false);
  const [sectionShowing, _setSectionShowing] = useState(false);
  const setSectionShowing = useCallback(
    (v: boolean) => {
      if (downLg) {
        _setSectionShowing(v);
      }
    },
    [downLg]
  );
  const [sectionStickyTop, setSectionStickyTop] = useState(0);
  const [pageElm, setPageElm] = useState<Element | null>(null);
  const [overviewElms, setOverviewElms] = useState<Element[]>([]);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 200
  });

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setPageElm(node); // pageEle 他で使う
    }
  }, []);

  useEffect(() => {
    setSectionStickyTop(
      sectionShowing ? 0 : pageElm ? -pageElm.getBoundingClientRect().bottom : 0
    );
  }, [sectionShowing, pageElm]);

  const overviewRef = useCallback(
    (node) => {
      if (node !== null) {
        const elms: Element[] = new Array(pageData.deck.slide.items.length);
        (document.querySelectorAll('.slides > ul > li') || []).forEach(
          (n, i) => {
            elms[i] = n;
          }
        );
        setOverviewElms(elms);
      }
    },
    [pageData.deck.slide.items.length]
  );

  useEffect(() => {
    if (pageElm && overviewElms && overviewElms.length > 0) {
      const scroller = window;
      let timerId: any = 0;
      const handleScroll = () => {
        if (timerId !== 0) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
          timerId = 0;
          if (sectionShowing && !pageSwitched) {
            const { height, bottom } = pageElm.getBoundingClientRect();
            const top = bottom - height * 0.3;
            const idx = overviewElms.findIndex(
              (elm) => elm.getBoundingClientRect().top > top
            );
            if (idx >= 0) {
              setCurPageIdx(idx);
            }
          }
        }, 400);
      };
      scroller.addEventListener('scroll', handleScroll);
      return () => {
        if (timerId !== 0) {
          clearTimeout(timerId);
        }
        scroller.removeEventListener('scroll', handleScroll);
      };
    }
  }, [pageElm, overviewElms, sectionShowing, pageSwitched]);

  useEffect(() => {
    if (pageSwitched) {
      let timerId: any = setTimeout(() => {
        clearTimeout(timerId);
        setPageSwitched(false);
      }, 800);
      return () => {
        if (timerId !== 0) {
          clearTimeout(timerId);
        }
      };
    }
  }, [pageSwitched]);

  useEffect(() => {
    const lastPageIdx = overviewElms.length - 1;
    const handleKeyup = (e: Event) => {
      const key = ((e as unknown) as KeyboardEvent).key;
      if (key === 'ArrowLeft') {
        if (pageIdx > 0) {
          setCurPageIdx(pageIdx - 1);
        } else {
          setCurPageIdx(lastPageIdx);
        }
      } else if (key === 'ArrowRight') {
        if (pageIdx < lastPageIdx) {
          setCurPageIdx(pageIdx + 1);
        } else {
          setCurPageIdx(0);
        }
      }
    };
    document.addEventListener('keyup', handleKeyup);
    return () => {
      document.removeEventListener('keyup', handleKeyup);
    };
  }, [overviewElms.length, pageIdx]);

  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <LayoutDeck
      apiName={'deck'}
      {...pageData}
      sectionStickyTop={sectionStickyTop}
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
                {pageData.articleTitle}
              </Typography>
            </Box>
            <Box
              className={`${classes['DeckInfo']}${
                navOpen ? ' DeckInfo-Open' : ''
              }`}
            >
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
              <Box className={classes['DeckInfo-Buttons-outer']}>
                <Button
                  className="MuiButton-outlinedPrimary"
                  //variant="outlined"
                  component={Link}
                  href="/slides[id]"
                  as={`/slides/${pageData.id}`}
                  startIcon={<SlideshowIcon />}
                  // color="primary"
                >
                  <Typography component="span">プレゼンテーション</Typography>
                </Button>
                <Button
                  className="MuiButton-outlinedSecondary MuiTypography-colorSecondary"
                  component={Link}
                  href={pdfPath}
                  startIcon={<GetAppIcon />}
                  disabled={pdfPath === ''}
                  color="secondary"
                >
                  <Typography component="span" color="secondary">
                    PDF ダウンロード
                  </Typography>
                </Button>
                <Button
                  className="MuiButton-outlinedSecondary MuiTypography-colorSecondary"
                  component={Link}
                  href={pptxPath}
                  startIcon={<GetAppIcon />}
                  // color="primary"
                  disabled={pptxPath === ''}
                  color="secondary"
                >
                  <Typography>PPTX ダウンロード</Typography>
                </Button>
              </Box>
            </Box>
            <article
              id={pageData.deck.overview.id}
              className={classes['Deck-overview-root']}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: pageData.deck.overview.css
                }}
              />
              <div ref={overviewRef} className="slides">
                <Timeline>
                  {pageData.deck.overview.items.map(({ html }, i, items) => (
                    <TimelineItem key={i}>
                      <TimelineSeparator>
                        <ButtonSelect
                          onClick={() => {
                            if (curPageIdx !== i || !sectionShowing) {
                              setSectionShowing(true);
                              setPageSwitched(true);
                              setPageIdx(i);
                              setCurPageIdx(i);
                              return;
                            }
                            setSectionShowing(false);
                          }}
                        >
                          <Avatar
                            className={
                              i === pageIdx
                                ? classes['Deck-overview-curPage']
                                : ''
                            }
                          >
                            <Typography>{`${i + 1}`}</Typography>
                          </Avatar>
                        </ButtonSelect>
                        {i + 1 < items.length && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <ButtonSelect
                          onClick={() => {
                            if (curPageIdx !== i || !sectionShowing) {
                              setSectionShowing(true);
                              setPageSwitched(true);
                              setPageIdx(i);
                              setCurPageIdx(i);
                              return;
                            }
                            setSectionShowing(false);
                          }}
                        >
                          <div
                            id={`page-${i}`}
                            className="slide"
                            dangerouslySetInnerHTML={{
                              __html: html
                            }}
                          />
                        </ButtonSelect>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </div>
            </article>
          </Box>
        </>
      }
      section={
        <div ref={measuredRef} className={classes['Page-root']}>
          <Paper
            elevation={trigger && downLg && sectionShowing ? 2 : 0}
            className={classes['Page-paper']}
          >
            <article id={pageData.deck.slide.id}>
              <div className="slides">
                <style
                  dangerouslySetInnerHTML={{
                    __html: pageData.deck.slide.css
                  }}
                />
                <Carousel
                  autoPlay={false}
                  animation={'slide'}
                  index={curPageIdx}
                  fullHeightHover={false}
                  onChange={(index: any) => {
                    if (!pageSwitched) {
                      const to =
                        overviewElms && overviewElms.length >= index
                          ? overviewElms[index]
                          : null;
                      if (to && (downLg === false || sectionShowing)) {
                        //to.scrollIntoView({ behavior: 'smooth' });
                        const { top, bottom } = to.getBoundingClientRect();
                        const topOffset = downLg
                          ? pageElm?.getBoundingClientRect().bottom || 0
                          : appBarHeight + theme.spacing(2); // .Page-root の top と合わせる.
                        if (top < topOffset) {
                          scroll.scrollTo(
                            document.documentElement.scrollTop +
                              top -
                              topOffset -
                              theme.spacing(1),
                            { duration: 800 }
                          );
                        } else if (
                          document.documentElement.clientHeight <= bottom
                        ) {
                          scroll.scrollTo(
                            document.documentElement.scrollTop +
                              bottom -
                              document.documentElement.clientHeight +
                              theme.spacing(1),
                            { duration: 800 }
                          );
                        }
                      }
                    }
                    setPageIdx(index);
                    setPageSwitched(true);
                  }}
                >
                  {pageData.deck.slide.items.map(({ html }, i) => (
                    <div
                      key={i}
                      className="slideDeck"
                      dangerouslySetInnerHTML={{
                        __html: html
                      }}
                    />
                  ))}
                </Carousel>
              </div>
            </article>
          </Paper>
        </div>
      }
      notification={pageData.notification}
    ></LayoutDeck>
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
  let pdfPath = '';
  let pptxPath = '';
  const fallback = process.env.USE_FALLBACK ? true : false;
  if (!fallback) {
    // 静的に生成されるときだけ実行.
    // 画像作成、ここで作成するのは最適?
    const needWrite = slideCacheSetup(
      context.params?.id as string,
      others.deck.slide.hash
    );
    await writeSlideTitleImage(
      needWrite,
      context.params?.id as string,
      others.deck.slide.hash,
      others.deck.slide.source
    );
    pdfPath = await writeSlidePdf(
      needWrite,
      context.params?.id as string,
      others.deck.slide.hash,
      others.deck.slide.source
    );
    pptxPath = await writeSlidePptx(
      needWrite,
      context.params?.id as string,
      others.deck.slide.hash,
      others.deck.slide.source
    );
  }
  return {
    props: {
      pageData: { ...others },
      comment: others.meta.description || html,
      pdfPath,
      pptxPath
      //items
    }
  };
};
