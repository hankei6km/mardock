import React, { ReactElement, useEffect, useContext, useState } from 'react';
// import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { UseScrollTriggerOptions } from '@material-ui/core/useScrollTrigger/useScrollTrigger';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Slide from '@material-ui/core/Slide';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import { browser as marpCoreBrowserScript } from '@marp-team/marp-core/browser';
import Notification from './Notification';
import { PageData } from '../types/pageTypes';
import { ApiNameArticle } from '../types/apiName';
import SiteContext from './SiteContext';
import Link from './Link';
import NavMain from './NavMain';
import NavBreadcrumbs from './NavBreadcrumbs';
import DateUpdated from './DateUpdated';
import { gridTempalteAreasFromLayout } from '../utils/grid';

export const appBarHeight = 64;

const useStyles = makeStyles((theme) => ({
  'Header-root': {
    position: 'fixed',
    top: 0,
    backgroundColor: theme.palette.background.default
  },
  'Header-toolbar': {
    width: '100%',
    // alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  'Header-content': {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    // flexWrap: 'wrap'
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row'
    }
  },
  'Header-title': {
    flexGrow: 1,
    display: 'flex',
    padding: theme.spacing(1, 1)
    //paddingLeft: theme.spacing(1),
    //paddingRight: theme.spacing(1)
  },
  'Header-site-title-root': {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center'
  },
  'Header-site-title-image': () => ({
    // width: theme.typography.h3.fontSize,
    marginRight: theme.spacing(2)
    // marginBottom: theme.spacing(2)
  }),
  'Header-site-title-text-outer': {
    flexGrow: 1
  },
  'Header-site-title-text-plain': {
    ...theme.typography.h4,
    color: theme.palette.text.primary
  },
  'Header-site-title-text-strong': {
    ...theme.typography.h4,
    color: theme.palette.primary.main
  },
  'NavMain-menu-button-outer': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    widht: '100%'
  },
  'NavMain-menu-button': {
    display: 'block',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  'NavMain-outer': {
    overflow: 'hidden',
    transition: 'max-height .3s',
    maxHeight: 200,
    '&:not(.Header-content-NavOpen)': {
      maxHeight: 0
    },
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      alignItems: 'center',
      borderLeft: `1px solid ${theme.palette.divider}`,
      maxHeight: 200,
      '&:not(.Header-content-NavOpen)': {
        maxHeight: 200
      }
    }
  },
  'NavMain-root': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  'NavBreadcrumbs-outer': ({ apiName, id }: Props) => {
    let backgroundColor = theme.palette.content.background.default.main;
    if (apiName === 'pages' && id === 'home') {
      backgroundColor = theme.palette.content.background.home.main;
    }
    if (apiName === 'pages' && id === 'deck') {
      backgroundColor = theme.palette.content.background.deck.main;
    }
    return {
      width: '100%',
      display: 'none',
      minHeight: theme.spacing(2),
      zIndex: theme.zIndex.appBar - 1,
      padding: theme.spacing(1, 0),
      backgroundColor,
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(1),
        display: 'block'
      }
    };
  },
  NavBreadcrumbs: {
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(1)
    }
  },
  'NavBreadcrumbs-divider': {
    width: '100%',
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block'
    }
  },
  'DateUpdated-root': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  'Layout-section-root': ({
    topSection,
    topPersistSection,
    bottomSection,
    apiName,
    id
  }: Props) => {
    let backgroundColor = theme.palette.content.background.default.main;
    if (apiName === 'pages' && id === 'home') {
      backgroundColor = theme.palette.content.background.home.main;
    }
    if (apiName === 'pages' && id === 'deck') {
      backgroundColor = theme.palette.content.background.deck.main;
    }
    return {
      height: '100%',
      padding: theme.spacing(1, 0),
      backgroundColor,
      width: '100%',
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(1, 1)
      },
      '& .Layout-body': {
        // 子要素に直接 classes から classNAme 指定すると props 変更で更新されない.
        // props 操作の入れ子がダメ？:
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
          margin: theme.spacing(0, 0, 2, 0),
          display: 'grid',
          gridGap: theme.spacing(1),
          gridTemplateColumns: 'repeat(11, 1fr)',
          gridTemplateRows: 'minmax(200px, auto)',
          gridTemplateAreas: gridTempalteAreasFromLayout({
            top: topPersistSection || topSection,
            main: true,
            bottom: bottomSection
          })
          // '"top main"' +
          // '"bottom main"'
          // こうしたかったが、top と bottom をまとめて sticky にする方法が思いつかなかった.:
          // いまのレイアウトだとここだけ grid にする意味もないが、
          // 思いついたときように残しておく。
        }
      }
    };
  },
  // 'Layout-body': ({ topPersistSection, topSection, bottomSection }: Props) => ({
  // }),
  'Layout-children': {
    widht: '100%'
  },
  'Layout-section-top': {
    gridArea: 'top',
    padding: theme.spacing(0, 1),
    [theme.breakpoints.up('md')]: {
      zIndex: 3,
      padding: theme.spacing(0)
      // position: 'fixed',
      // top: 110
    }
  },
  'Layout-section-top-inner': {
    [theme.breakpoints.up('md')]: {
      position: 'sticky',
      top: 76
    }
  },
  'Layout-section-top-persist': {},
  'Layout-section-top-not-persist': {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block'
    }
  },
  'Layout-section-bottom': {
    gridArea: 'bot',
    padding: theme.spacing(0, 1),
    [theme.breakpoints.up('md')]: {
      // maxWidth: theme.breakpoints.values['lg']
      zIndex: 1,
      height: '100%',
      padding: theme.spacing(0)
    }
  },
  'Layout-section': {
    gridArea: 'main',
    // width: '100%',
    zIndex: 2,
    [theme.breakpoints.up('md')]: {},
    ...theme.typography.body1,
    padding: theme.spacing(0, 1),
    '&  h2': {
      ...theme.typography.h4,
      marginBottom: theme.spacing(1)
    },
    '& > article > h3': {
      ...theme.typography.h6,
      marginBottom: theme.spacing(1),
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      borderLeft: `6px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.divider // ライトグレイぽい色は他にないかね
      // background: `linear-gradient(to right, ${theme.palette.primary.main} ,#f0f0f0)`
    },
    '& > article > h4': {
      ...theme.typography.h6,
      display: 'inline',
      marginBottom: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      // color: theme.palette.primary.contrastText,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main
    },
    '& > article > :not(section) a': {
      textDecorationLine: 'none',
      '&:hover': {
        textDecorationLine: 'underline'
      }
    },
    '& > article > p > img, article > p > a > img': {
      borderRadius: theme.shape.borderRadius,
      width: '100%',
      height: '100%'
      // objectFit: 'contain'
    },
    '& > article > ul': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(4)
      }
    },
    '& > article pre > code': {
      borderRadius: theme.shape.borderRadius,
      fontSize: theme.typography.body2.fontSize,
      [theme.breakpoints.up('sm')]: {
        fontSize: theme.typography.body1.fontSize
      }
    },
    '& > article :not(pre) > code': {
      padding: '.2em .4em',
      margin: 0,
      fontSize: '95%',
      backgroundColor: 'rgba(27,31,35,.1);',
      borderRadius: '3px'
    },
    '& > article > blockquote': {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1),
      borderLeft: `6px solid ${theme.palette.secondary.main}`,
      backgroundColor: theme.palette.divider
    },
    '& > article  > table': {
      display: 'block', // table 自体をスクロールさせるため(thead 等はそのままでもよい?)
      overflow: 'auto',
      maxWidth: '100%',
      width: 'max-content',
      borderCollapse: 'collapse',
      border: `solid 1px ${theme.palette.primary.main}`,
      borderRadius: theme.shape.borderRadius,
      // borderSpacing: `${theme.spacing(1)}px`,
      '& > thead': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '& th': {
          padding: theme.spacing(1, 2)
        }
      },
      '& > tbody': {
        // border: `solid 1px ${theme.palette.divider}`,
        '& tr:nth-child(even)': {
          backgroundColor: theme.palette.divider
        },
        // '& tr + tr': {
        //   borderTop: `solid 1px ${theme.palette.divider}`
        // },
        '& tr > td': {
          padding: theme.spacing(1, 2)
        }
      }
    },
    '& > article > .embed.youtube': {
      marginBottom: theme.spacing(1)
    },
    '& > section': {
      // children のセクション
      marginBottom: theme.spacing(0.5),
      '& h3': {
        ...theme.typography.h6,
        marginTop: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.divider // ライトグレイぽい色は他にないかね
        // background: `linear-gradient(to right, ${theme.palette.primary.main} ,#f0f0f0)`
      },
      '& h4': {
        ...theme.typography.h6,
        display: 'inline',
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        // color: theme.palette.primary.contrastText,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        backgroundColor: theme.palette.primary.main
      }
    }
  },
  footer: {
    padding: theme.spacing(1),
    minHeight: 200,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    '& .MuiIconButton-label': {
      color: theme.palette.getContrastText(theme.palette.primary.main)
    }
  }
}));

const ogImageParams = new URLSearchParams('');
ogImageParams.append('fit', 'crop');
ogImageParams.append('w', '1200');
ogImageParams.append('h', '630');
const ogImageParamsStr = ogImageParams.toString();

export type Props = {
  apiName: ApiNameArticle;
  children?: ReactElement;
  section?: ReactElement;
  topSection?: ReactElement;
  topPersistSection?: ReactElement;
  bottomSection?: ReactElement;
  headerHideOptions?: UseScrollTriggerOptions;
  classes?: { [key: string]: string }; // prune をかけないので注意
} & Partial<PageData>;

function getAvatarSrcSet(src: string): string {
  const u = src.split('?', 2)[0];
  // return encodeURIComponent(
  return `${u}?dpr64=Mw&fit64=Y3JvcA&h64=MTIw&w64=MTIw 3x, ${u}?dpr64=Mg&fit64=Y3JvcA&h64=MTIw&w64=MTIw 2x, ${u}?dpr64=&fit64=Y3JvcA&h64=MTIw&w64=MTIw 1x`;
}

function HideOnScroll({
  children,
  alwaysShowing,
  headerHideOptions = {}
}: {
  children?: ReactElement;
  alwaysShowing: boolean;
  headerHideOptions?: UseScrollTriggerOptions;
}) {
  // https://material-ui.com/components/app-bar/#hide-app-bar
  const trigger = useScrollTrigger(headerHideOptions);

  return (
    <Slide
      appear={false}
      direction="down"
      in={!trigger || alwaysShowing}
      //style={{ transitionDelay: !trigger ? '500ms' : '0ms' }}
    >
      {children}
    </Slide>
  );
}

const Layout = ({
  apiName,
  id,
  children,
  section,
  topSection,
  topPersistSection,
  bottomSection,
  updated,
  title = 'This is the default title',
  articleTitle,
  html: html = '',
  notification,
  meta: pageMeta = { title: '', keyword: [], image: '', description: '' }, // blankMetaData は使わない
  headerHideOptions = {},
  classes: inClasses
}: Props) => {
  const classes = useStyles({
    apiName,
    id: id || '',
    topSection,
    topPersistSection,
    bottomSection,
    classes: inClasses
  });
  const { siteNameDecorated, siteIcon } = useContext(SiteContext);
  const [navOpen, setNavOpen] = useState(false);
  const maxWidth = 'lg';
  const theme = useTheme();
  //最初に false になるが、ロード時の不自然な動作はでないと
  const downMd = useMediaQuery(theme.breakpoints.down('sm'));
  const [alwaysShowing, setAlwaysShowing] = useState(false);
  const avatarSrc = siteIcon.url;
  const avatarSrcSet = getAvatarSrcSet(avatarSrc);
  const _title =
    apiName === 'pages' && id === 'home'
      ? `${pageMeta.title} | static slide site`
      : `${pageMeta.title} | mardock | static slide site`;
  const description = pageMeta.description;
  let ogImageUrl = pageMeta.image;
  if (ogImageUrl.startsWith('https://images.microcms-assets.io/')) {
    ogImageUrl = `${pageMeta.image}?${ogImageParamsStr}`;
  }
  // header footer は https://github.com/hankei6km/my-starter-nextjs-typescript-material-ui-micro-cms-aspida に outer で記述だが、
  // 今回は直接記述.
  useEffect(() => {
    //https://github.com/marp-team/marp-core/blob/6dbdf266051940b69775139d5a830ea34daf0b1f/src/script/script.ts#L45
    // setMarpFittingScript(
    //   `https://cdn.jsdelivr.net/npm/${marpCoreName}@${marpCoreVersion}/lib/browser.js`
    // );
    // やってることは上記 CDN で読み込む場合と同じだと思う、たぶん
    // 追記.
    // https://github.com/marp-team/marp-core#script-boolean--object に書いてあった。
    // が、 cleanup の使い方は不明.
    // ページ別に実行(cleanup)した方が良いのか？
    const cleanup = marpCoreBrowserScript();
    return () => cleanup();
  }, []);
  useEffect(() => {
    const a = navOpen || !downMd;
    if (a) {
      setAlwaysShowing(true);
    } else {
      let id: any = setTimeout(() => {
        id = 0;
        setAlwaysShowing(false);
      }, 400);
      return () => {
        if (id !== 0) {
          clearTimeout(id);
        }
      };
    }
  }, [navOpen, downMd]);

  return (
    <>
      <Head>
        <title>{_title}</title>
        <meta charSet="utf-8" />
        <meta name="og:title" content={_title} />
        {description && <meta name="description" content={description} />}
        {description && <meta name="og:description" content={description} />}
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <HideOnScroll
        alwaysShowing={alwaysShowing}
        headerHideOptions={headerHideOptions}
      >
        <Box>
          <AppBar
            component="header"
            // color="default"
            className={classes['Header-root']}
          >
            <Container maxWidth={maxWidth} disableGutters>
              <Toolbar disableGutters className={classes['Header-toolbar']}>
                <Box className={classes['Header-content']}>
                  <Box className={classes['Header-title']}>
                    <Box className={classes['Header-site-title-root']}>
                      <Avatar
                        component={Link}
                        href={'/'}
                        className={classes['Header-site-title-image']}
                        alt={siteIcon.alt}
                        imgProps={{ width: 120, height: 120 }}
                        src={avatarSrc}
                        srcSet={avatarSrcSet}
                      />
                      <Typography
                        component="h1"
                        className={classes['Header-site-title-text-outer']}
                      >
                        <Link href="/" underline="none" color="textPrimary">
                          {siteNameDecorated.map((t, i) => (
                            <Typography
                              key={`site-title:${i}`}
                              component="span"
                              className={
                                classes[
                                  t.strong
                                    ? 'Header-site-title-text-strong'
                                    : 'Header-site-title-text-plain'
                                ]
                              }
                            >
                              {t.label}
                            </Typography>
                          ))}
                        </Link>
                      </Typography>
                    </Box>
                    <Box className={classes['NavMain-menu-button-outer']}>
                      <IconButton
                        aria-label="toggle primary-navigation"
                        className={classes['NavMain-menu-button']}
                        onClick={() => setNavOpen(!navOpen)}
                      >
                        <MenuIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box
                    className={
                      navOpen
                        ? `${classes['NavMain-outer']} Header-content-NavOpen`
                        : classes['NavMain-outer']
                    }
                  >
                    <NavMain
                      classes={{ 'NavMain-root': classes['NavMain-root'] }}
                    />
                  </Box>
                </Box>
              </Toolbar>
            </Container>
          </AppBar>
          <Box style={{ height: appBarHeight }} />
        </Box>
      </HideOnScroll>
      <Box className={classes['NavBreadcrumbs-outer']}>
        {(apiName === 'deck' || apiName === 'docs') && (
          <>
            <Container
              maxWidth={maxWidth}
              disableGutters
              className={classes['NavBreadcrumbs']}
            >
              <NavBreadcrumbs lastBreadcrumb={title} classes={classes} />
            </Container>
            <Divider className={classes['NavBreadcrumbs-divider']} />
          </>
        )}
      </Box>
      <Box className={classes['Layout-section-root']}>
        <Container maxWidth={maxWidth} disableGutters>
          <Box className={'Layout-body'}>
            {(topPersistSection || topSection) && (
              <Box className={classes['Layout-section-top']}>
                <Box className={classes['Layout-section-top-inner']}>
                  {topPersistSection && (
                    <Box className={classes['Layout-section-top-persist']}>
                      {topPersistSection}
                    </Box>
                  )}
                  {topSection && (
                    <Box className={classes['Layout-section-top-not-persist']}>
                      {topSection}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            <Box component="section" className={classes['Layout-section']}>
              {section ? (
                <>{section}</>
              ) : (
                <>
                  <Typography component="h2">{articleTitle}</Typography>
                  {apiName === 'deck' && (
                    <DateUpdated updated={updated} classes={classes} />
                  )}
                  <article
                    dangerouslySetInnerHTML={{
                      __html: html
                    }}
                  ></article>
                  <Box className={classes['Layout-children']}>{children}</Box>
                </>
              )}
            </Box>
            {bottomSection && (
              <Box className={classes['Layout-section-bottom']}>
                {bottomSection}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      <footer className={classes.footer}>
        <Container maxWidth={maxWidth} disableGutters>
          <Typography variant="body1">Copyright (c) 2021 hankei6km</Typography>
          <IconButton
            aria-label="link to GitHub account"
            component={Link}
            href="https://github.com/hankei6km"
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            aria-label="link to Twitter account"
            component={Link}
            href="https://twitter.com/hankei6km"
          >
            <TwitterIcon />
          </IconButton>
        </Container>
      </footer>
      {notification && notification.title && (
        <Notification
          title={notification.title}
          messageHtml={notification.messageHtml}
          serverity={notification.serverity}
        />
      )}
    </>
  );
};

export default Layout;

// avatar の srcset などを作成したときのソース.
// 適当な保存場所がなかったので、ここに貼り付けておく.
// {
//   "imageBaseUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//   "baseParameterSet": [
//     {}
//   ],
//   "baseMedias": [],
//   "editTargetKey": "EDIT-TARGET-KEY",
//   "defaultTargetKey": "DEFAULT-TARGET-KEY",
//   "card": {
//     "cardType": "summary_large_image",
//     "title": "",
//     "description": ""
//   },
//   "tagFragment": {
//     "altText": "",
//     "linkText": "",
//     "asThumb": true,
//     "newTab": false,
//     "srcsetDescriptor": "auto",
//     "disableWidthHeight": false
//   },
//   "previewSetState": "edited",
//   "previewSetKind": "data",
//   "previewSet": [
//     {
//       "itemKey": "EDIT-TARGET-KEY",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=Mw&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": "3"
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 360,
//       "imgHeight": 360,
//       "imgDispDensity": 3,
//       "media": "auto"
//     },
//     {
//       "itemKey": "ITEM-KEY-2",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=Mg&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": "2"
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 240,
//       "imgHeight": 240,
//       "imgDispDensity": 2,
//       "media": "auto"
//     },
//     {
//       "itemKey": "ITEM-KEY-3",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": ""
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 120,
//       "imgHeight": 120,
//       "imgDispDensity": null,
//       "media": "auto"
//     },
//     {
//       "itemKey": "DEFAULT-TARGET-KEY",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": ""
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 120,
//       "imgHeight": 120,
//       "imgDispDensity": null,
//       "media": "auto"
//     }
//   ]
// }
