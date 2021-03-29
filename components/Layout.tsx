import React, { ReactNode, useContext, useState } from 'react';
// import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core';
// import NoSsr from '@material-ui/core/NoSsr';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import Notification from './Notification';
import { PageData } from '../types/pageTypes';
import { ApiNameArticle } from '../types/apiName';
import SiteContext from './SiteContext';
import Link from './Link';
import NavMain from './NavMain';
import NavBreadcrumbs from './NavBreadcrumbs';
import DateUpdated from './DateUpdated';

const useStyles = makeStyles((theme) => ({
  'Header-root': {
    position: 'sticky',
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
  'Header-site-title-text': {
    flexGrow: 1,
    ...theme.typography.h4
    // padding: 0
  },
  'NavMain-menu-button-outer': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
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
  'NavBreadcrumbs-outer': {
    width: '100%',
    padding: theme.spacing(1),
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block'
    }
  },
  'DateUpdated-root': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  'Layout-section-root': {
    height: '100%',
    padding: theme.spacing(1, 0),
    backgroundColor: theme.palette.grey[300],
    width: '100%',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1, 1)
    }
  },
  'Layout-body': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'start'
    },
    width: '100%'
  },
  'Layout-section-top': {
    width: 300
  },
  'Layout-section-bottom': {
    width: 300
  },
  'Layout-section': {
    flexGrow: 1,
    ...theme.typography.body1,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '&  h2': {
      ...theme.typography.h4,
      marginBottom: theme.spacing(1)
    },
    '& article > h3': {
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
    '& article > h4': {
      ...theme.typography.h6,
      display: 'inline',
      marginBottom: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      // color: theme.palette.primary.contrastText,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main
    },
    '& article > :not(section) a': {
      textDecorationLine: 'none',
      '&:hover': {
        textDecorationLine: 'underline'
      }
    },
    '& article > p > img, article > p > a > img': {
      width: '100%',
      height: '100%'
      // objectFit: 'contain'
    },
    '& article > ul': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(4)
      }
    },
    '& article :not(pre) > code': {
      padding: '.2em .4em',
      margin: 0,
      fontSize: '95%',
      backgroundColor: 'rgba(27,31,35,.1);',
      borderRadius: '3px'
    },
    '& article > blockquote': {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      padding: theme.spacing(1),
      borderLeft: `6px solid ${theme.palette.secondary.main}`,
      backgroundColor: theme.palette.divider
    },
    '& article > .embed.youtube': {
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

type Props = {
  apiName: ApiNameArticle;
  children?: ReactNode;
  topSection?: ReactNode;
  bottomSection?: ReactNode;
} & Partial<PageData>;

function getAvatarSrcSet(src: string): string {
  const u = src.split('?', 2)[0];
  // return encodeURIComponent(
  return `${u}?dpr64=Mw&fit64=Y3JvcA&h64=MTIw&w64=MTIw 3x, ${u}?dpr64=Mg&fit64=Y3JvcA&h64=MTIw&w64=MTIw 2x, ${u}?dpr64=&fit64=Y3JvcA&h64=MTIw&w64=MTIw 1x`;
}

const Layout = ({
  apiName,
  id,
  children,
  topSection,
  bottomSection,
  updated,
  title = 'This is the default title',
  description,
  articleTitle,
  html: html = '',
  mainVisual = { url: '', width: 0, height: 0 },
  notification
}: Props) => {
  const classes = useStyles();
  const { siteName, siteIcon } = useContext(SiteContext);
  const [navOpen, setNavOpen] = useState(false);
  const maxWidth = 'lg';
  // const router = useRouter();
  const avatarSrc = siteIcon.url;
  const avatarSrcSet = getAvatarSrcSet(avatarSrc);
  const _title =
    apiName === 'pages' && id === 'home'
      ? `${title} | static slide site`
      : `${title} | mardock | static slide site`;
  const ogImageUrl = mainVisual ? `${mainVisual}?${ogImageParamsStr}` : '';
  // header footer は https://github.com/hankei6km/my-starter-nextjs-typescript-material-ui-micro-cms-aspida に outer で記述だが、
  // 今回は直接記述.
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
                    className={classes['Header-site-title-text']}
                  >
                    <Link href="/" underline="none" color="textPrimary">
                      {siteName}
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
            {apiName === 'deck' && (
              <Box className={classes['NavBreadcrumbs-outer']}>
                <NavBreadcrumbs lastBreadcrumb={title} classes={classes} />
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Box className={classes['Layout-section-root']}>
        <Container
          maxWidth={maxWidth}
          disableGutters
          className={classes['Layout-body']}
        >
          {topSection && (
            <Box component="section" className={classes['Layout-section-top']}>
              {topSection}
            </Box>
          )}
          <Box component="section" className={classes['Layout-section']}>
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
              {children}
            </>
          </Box>
          {bottomSection && (
            <Box
              component="section"
              className={classes['Layout-section-bottom']}
            >
              {bottomSection}
            </Box>
          )}
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
